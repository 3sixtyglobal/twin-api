// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealthComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { BaseError, ComponentFactory, type HealthStatus, type IHealth, Is } from "@twin.org/core";
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
	private _healthInfo: IHealth[];

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
		this._healthInfo = [];
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

		if (!Is.empty(engineCore)) {
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

					for (const componentHealth of allHealth) {
						await this.setComponentHealth(componentHealth);
					}
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
		const contextIds = await ContextIdStore.getContextIds();
		const tenantId = contextIds?.[ContextIdKeys.Tenant];

		const components = this._healthInfo.filter(c => {
			const componentTenantId = c.properties?.tenantId;
			return Is.empty(componentTenantId) || componentTenantId === tenantId;
		});

		const errorCount = components.filter(c => c.status === "error").length;
		const warningCount = components.filter(c => c.status === "warning").length;

		let finalStatus: HealthStatus = "ok";
		if (errorCount > 0) {
			finalStatus = "error";
		} else if (warningCount > 0) {
			finalStatus = "warning";
		}

		return {
			status: finalStatus,
			components
		};
	}

	/**
	 * Set the health status for a component.
	 * @param health The health of the component.
	 * @returns Nothing.
	 * @internal
	 */
	private async setComponentHealth(health: IHealth): Promise<void> {
		const componentTenantId = health.properties?.tenantId;
		const componentIndex = Is.empty(componentTenantId)
			? this._healthInfo?.findIndex(c => c.name === health.name && Is.empty(c.properties?.tenantId))
			: this._healthInfo?.findIndex(
					c => c.name === health.name && c.properties?.tenantId === componentTenantId
				);

		if (componentIndex === -1) {
			this._healthInfo.push(health);
		} else {
			this._healthInfo[componentIndex] = health;
		}
	}
}
