// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealthComponent } from "@twin.org/api-models";
import { ContextIdStore } from "@twin.org/context";
import { BaseError, ComponentFactory, HealthStatus, type IHealth, Is } from "@twin.org/core";
import { EngineCoreFactory, type IEngineCore } from "@twin.org/engine-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import type { IHealthServiceConstructorOptions } from "./models/IHealthServiceConstructorOptions.js";

/**
 * The health service for the server.
 */
export class HealthService implements IHealthComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HealthService>();

	/**
	 * The server health.
	 * @internal
	 */
	private _healthInfo: {
		status: HealthStatus;
		components: IHealth[];
	};

	/**
	 * The interval for checking the health of the components and setting it in the health service.
	 * @internal
	 */
	private readonly _healthCheckInterval: number;

	/**
	 * The initial interval for checking the health of the components and setting it in the health service.
	 * This is used to check the health of the components immediately after the service is started.
	 * @internal
	 */
	private readonly _initialInterval: number;

	/**
	 * Interval for checking the health of the components and setting it in the health service.
	 * @internal
	 */
	private _healthTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

	/**
	 * Whether the service has been started.
	 * @internal
	 */
	private _started: boolean;

	/**
	 * Create a new instance of HealthService.
	 * @param options The constructor options.
	 */
	constructor(options?: IHealthServiceConstructorOptions) {
		this._healthInfo = { status: HealthStatus.Ok, components: [] };
		this._healthCheckInterval = options?.config?.healthCheckInterval ?? 60000;
		this._initialInterval = options?.config?.initialInterval ?? 2000;
		this._started = false;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return HealthService.CLASS_NAME;
	}

	/**
	 * The component needs to be started when the node is initialized.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns A promise that resolves when the initial health check timer has been scheduled.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		const engineCore = EngineCoreFactory.getIfExists("engine");

		if (!Is.empty(engineCore) && !this._started) {
			this._started = true;

			// Immediately check health after a startup settling period
			// the interval for the next checks are trigger on success of the current
			// check to prevent overlapping checks in case of long running health checks
			this.startTimer(engineCore, nodeLoggingComponentType, this._initialInterval);
		}
	}

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns A promise that resolves when the health check timer has been cancelled.
	 */
	public async stop(nodeLoggingComponentType?: string): Promise<void> {
		if (this._started) {
			this._started = false;
			this.stopTimer();
		}
	}

	/**
	 * Get the server health.
	 * @returns The service health.
	 */
	public async healthStatus(): Promise<{ status: HealthStatus; components: IHealth[] }> {
		return this._healthInfo;
	}

	/**
	 * Check the health of all registered components and set the health info in the service.
	 * @param engineCore The engine core to get the registered components from.
	 * @param nodeLoggingComponentType The node logging component type to log any errors that occur during health checks.
	 * @returns A promise that resolves when all component health checks are complete and the next check is scheduled.
	 * @internal
	 */
	private async checkHealth(
		engineCore: IEngineCore,
		nodeLoggingComponentType?: string
	): Promise<void> {
		this.stopTimer();

		await ContextIdStore.run(engineCore.getContextIds() ?? {}, async () => {
			const allHealth: IHealth[] = [];

			const registeredInstances = await engineCore.getRegisteredComponents();
			for (const registeredInstance of registeredInstances) {
				const healthMethod = registeredInstance.component.health?.bind(
					registeredInstance.component
				);
				if (Is.function(healthMethod)) {
					try {
						allHealth.push(...(await healthMethod()));
					} catch (error) {
						const nodeLogging =
							ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
						await nodeLogging?.log({
							level: "error",
							source: HealthService.CLASS_NAME,
							message: "componentHealthCheckFailed",
							data: {
								className: registeredInstance.component.className()
							},
							error: BaseError.fromError(error)
						});
					}
				}
			}

			this.groupHealthByName(allHealth);
		});

		this.startTimer(engineCore, nodeLoggingComponentType, this._healthCheckInterval);
	}

	/**
	 * Group raw health entries by name, collapsing duplicates into a parent with a grouped array.
	 * @param entries The flat list of health entries from all components.
	 * @internal
	 */
	private groupHealthByName(entries: IHealth[]): void {
		const bySource = new Map<string, IHealth[]>();
		for (const entry of entries) {
			const existing = bySource.get(entry.source) ?? [];
			existing.push(entry);
			bySource.set(entry.source, existing);
		}

		const result: IHealth[] = [];
		for (const [source, group] of bySource) {
			if (group.length > 1) {
				let parentStatus: HealthStatus = HealthStatus.Ok;

				if (group.some(e => e.status === HealthStatus.Error)) {
					parentStatus = HealthStatus.Error;
				} else if (group.some(e => e.status === HealthStatus.Warning)) {
					parentStatus = HealthStatus.Warning;
				}

				result.push({ source, status: parentStatus, grouped: group });
			} else {
				result.push(group[0]);
			}
		}

		let finalStatus: HealthStatus = HealthStatus.Ok;
		if (result.some(e => e.status === HealthStatus.Error)) {
			finalStatus = HealthStatus.Error;
		} else if (result.some(e => e.status === HealthStatus.Warning)) {
			finalStatus = HealthStatus.Warning;
		}

		this._healthInfo = { status: finalStatus, components: result };
	}

	/**
	 * Start the timer.
	 * @param engineCore The engine core to get the registered components from.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @param interval The interval for checking the health of the components and setting it in the health service.
	 * @internal
	 */
	private startTimer(
		engineCore: IEngineCore,
		nodeLoggingComponentType: string | undefined,
		interval: number
	): void {
		if (this._started) {
			this._healthTimer = globalThis.setTimeout(
				async () => this.checkHealth(engineCore, nodeLoggingComponentType),
				interval
			);
		}
	}

	/**
	 * Stop the timer.
	 * @internal
	 */
	private stopTimer(): void {
		if (this._healthTimer) {
			globalThis.clearTimeout(this._healthTimer);
			this._healthTimer = undefined;
		}
	}
}
