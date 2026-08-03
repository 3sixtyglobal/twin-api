// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type IHealth,
	type IHealthComponent,
	HealthStatus,
	type IHealthProviderComponent
} from "@twin.org/api-models";
import type { IContextIds } from "@twin.org/context";
import { ContextIdStore, ContextIdKeys } from "@twin.org/context";
import { BaseError, ComponentFactory, Factory, type IComponent, Is } from "@twin.org/core";
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
	 * The Unix timestamp (ms) recorded at the start of the most recently completed health cycle.
	 * Passed to providers on the next cycle so they can compute deltas.
	 * @internal
	 */
	private _lastTimestamp: number;

	/**
	 * Whether to include stack traces in health check error details.
	 * @internal
	 */
	private readonly _includeErrorStack: boolean | undefined;

	/**
	 * Create a new instance of HealthService.
	 * @param options The constructor options.
	 */
	constructor(options?: IHealthServiceConstructorOptions) {
		this._healthInfo = { status: HealthStatus.Ok, components: [] };
		this._healthCheckInterval = options?.config?.healthCheckInterval ?? 60000;
		this._initialInterval = options?.config?.initialInterval ?? 2000;
		this._includeErrorStack = options?.config?.includeErrorStack;
		this._started = false;
		this._lastTimestamp = 0;
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
		if (!this._started) {
			this._started = true;

			// Immediately check health after a startup settling period
			// the interval for the next checks are trigger on success of the current
			// check to prevent overlapping checks in case of long running health checks
			this.startTimer(nodeLoggingComponentType, this._initialInterval);
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
	 * @param nodeLoggingComponentType The node logging component type to log any errors that occur during health checks.
	 * @returns A promise that resolves when all component health checks are complete and the next check is scheduled.
	 * @internal
	 */
	private async checkHealth(nodeLoggingComponentType?: string): Promise<void> {
		this.stopTimer();

		const engineCoreFactory = Factory.getFactory("engine-core");

		if (engineCoreFactory) {
			// Use a replica of the IEngineCore interface to avoid a circular dependency on the engine-core package.
			const engineCore = engineCoreFactory.getIfExists<{
				getContextIds: () => IContextIds | undefined;
				getRegisteredComponents: () => Promise<
					{
						instanceType: string;
						component: IComponent;
					}[]
				>;
			}>("engine");

			if (engineCore) {
				const lastTimestamp = this._lastTimestamp;
				this._lastTimestamp = Date.now();
				const engineContextIds = engineCore.getContextIds() ?? {};
				const registeredInstances = await engineCore.getRegisteredComponents();

				// Pass 1: Init — providers populate initContextIds with any IDs they establish
				const healthContextIds: IContextIds = {
					// Only use Node from the main engine context
					// All other keys should be provided by the healthInit methods of the components
					// as we don't want to use real ids
					[ContextIdKeys.Node]: engineContextIds[ContextIdKeys.Node]
				};
				for (const registeredInstance of registeredInstances) {
					if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
						const initMethod = registeredInstance.component.healthInit?.bind(
							registeredInstance.component
						);
						if (Is.function(initMethod)) {
							try {
								await initMethod(lastTimestamp, healthContextIds);
							} catch (error) {
								const nodeLogging =
									ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
								await nodeLogging?.log({
									level: "error",
									source: HealthService.CLASS_NAME,
									message: "componentHealthInitFailed",
									data: { className: registeredInstance.component.className() },
									error: BaseError.fromError(error)
								});
							}
						}
					}
				}

				// Pass 2: Health check wrapped in combined engine + init context
				const allHealth: IHealth[] = [];
				await ContextIdStore.run(healthContextIds, async () => {
					for (const registeredInstance of registeredInstances) {
						if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
							const healthMethod = registeredInstance.component.health?.bind(
								registeredInstance.component
							);
							if (Is.function(healthMethod)) {
								try {
									allHealth.push(...(await healthMethod(lastTimestamp)));
								} catch (error) {
									const nodeLogging =
										ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
									await nodeLogging?.log({
										level: "error",
										source: HealthService.CLASS_NAME,
										message: "componentHealthCheckFailed",
										data: { className: registeredInstance.component.className() },
										error: BaseError.fromError(error)
									});
								}
							}
						}
					}
				});

				// Pass 3: Teardown wrapped in combined engine + init context
				await ContextIdStore.run(healthContextIds, async () => {
					for (const registeredInstance of registeredInstances) {
						if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
							const teardownMethod = registeredInstance.component.healthTeardown?.bind(
								registeredInstance.component
							);
							if (Is.function(teardownMethod)) {
								try {
									await teardownMethod(lastTimestamp);
								} catch (error) {
									const nodeLogging =
										ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
									await nodeLogging?.log({
										level: "error",
										source: HealthService.CLASS_NAME,
										message: "componentHealthTeardownFailed",
										data: { className: registeredInstance.component.className() },
										error: BaseError.fromError(error)
									});
								}
							}
						}
					}
				});

				this.groupHealthByName(allHealth);

				this.startTimer(nodeLoggingComponentType, this._healthCheckInterval);
			}
		}
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
			existing.push({
				...entry,
				error: !Is.empty(entry.error)
					? BaseError.fromError(entry.error).toJsonObject(this._includeErrorStack)
					: undefined
			});
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
	 * @param nodeLoggingComponentType The node logging component type.
	 * @param interval The interval for checking the health of the components and setting it in the health service.
	 * @internal
	 */
	private startTimer(nodeLoggingComponentType: string | undefined, interval: number): void {
		if (this._started) {
			this._healthTimer = globalThis.setTimeout(
				async () => this.checkHealth(nodeLoggingComponentType),
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
