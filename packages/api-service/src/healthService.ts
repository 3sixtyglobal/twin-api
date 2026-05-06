// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealthComponent } from "@twin.org/api-models";
import { ContextIdStore } from "@twin.org/context";
import { BaseError, ComponentFactory, HealthStatus, type IHealth, Is } from "@twin.org/core";
import { EngineCoreFactory } from "@twin.org/engine-models";
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
	 * Interval for checking the health of the components and setting it in the health service.
	 * @internal
	 */
	private _healthInterval: NodeJS.Timeout | undefined;

	/**
	 * Create a new instance of HealthService.
	 * @param options The constructor options.
	 */
	constructor(options?: IHealthServiceConstructorOptions) {
		this._healthInfo = { status: HealthStatus.Ok, components: [] };
		this._healthCheckInterval = options?.config?.healthCheckInterval ?? 30000;
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
	 * @returns Nothing.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		const engineCore = EngineCoreFactory.getIfExists("engine");

		if (!Is.empty(engineCore) && Is.empty(this._healthInterval)) {
			this._healthInterval = globalThis.setInterval(async () => {
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
			}, this._healthCheckInterval);
		}
	}

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	public async stop(nodeLoggingComponentType?: string): Promise<void> {
		if (this._healthInterval) {
			clearInterval(this._healthInterval);
			this._healthInterval = undefined;
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
	 * Group raw health entries by name, collapsing duplicates into a parent with a grouped array.
	 * @param entries The flat list of health entries from all components.
	 * @returns The grouped list.
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
}
