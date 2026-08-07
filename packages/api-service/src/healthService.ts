// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type IHealth,
	type IHealthComponent,
	type HealthApplicationCallback,
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
	 * The interval for checking the health of the components.
	 * @internal
	 */
	private readonly _healthCheckInterval: number;

	/**
	 * The interval for running the application health lifecycle (init, application, teardown).
	 * @internal
	 */
	private readonly _healthApplicationCheckInterval: number;

	/**
	 * The initial interval for checking the health of the components.
	 * This is used to check the health of the components immediately after the service is started.
	 * @internal
	 */
	private readonly _initialInterval: number;

	/**
	 * Timer for the regular health check.
	 * @internal
	 */
	private _healthTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

	/**
	 * Timer for the application health lifecycle.
	 * @internal
	 */
	private _healthApplicationTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

	/**
	 * Whether the service has been started.
	 * @internal
	 */
	private _started: boolean;

	/**
	 * Health entries from the most recently completed regular health check.
	 * @internal
	 */
	private _regularComponents: IHealth[];

	/**
	 * Health entries from the most recently completed application health cycle.
	 * @internal
	 */
	private _applicationComponents: IHealth[];

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
		this._healthApplicationCheckInterval =
			options?.config?.healthCheckApplicationInterval ?? 300000;
		this._initialInterval = options?.config?.initialInterval ?? 2000;
		this._includeErrorStack = options?.config?.includeErrorStack;
		this._started = false;
		this._regularComponents = [];
		this._applicationComponents = [];
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
	 * @returns A promise that resolves when the initial health check timers have been scheduled.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		if (!this._started) {
			this._started = true;

			// Immediately check health after a startup settling period.
			// The interval for the next checks are triggered on success of the current
			// check to prevent overlapping checks in case of long running health checks.
			this.startTimer(nodeLoggingComponentType, this._initialInterval);
			this.startApplicationTimer(nodeLoggingComponentType, this._initialInterval);
		}
	}

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns A promise that resolves when the health check timers have been cancelled.
	 */
	public async stop(nodeLoggingComponentType?: string): Promise<void> {
		if (this._started) {
			this._started = false;
			this.stopTimer();
			this.stopApplicationTimer();
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
	 * Check the health of all registered components by calling health() on each.
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
				const registeredInstances = await engineCore.getRegisteredComponents();
				const allHealth: IHealth[] = [];

				for (const registeredInstance of registeredInstances) {
					if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
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
									data: { className: registeredInstance.component.className() },
									error: BaseError.fromError(error)
								});
							}
						}
					}
				}

				this._regularComponents = allHealth;
				this.groupHealthByName([...this._regularComponents, ...this._applicationComponents]);
				this.startTimer(nodeLoggingComponentType, this._healthCheckInterval);
			}
		}
	}

	/**
	 * Run the application health lifecycle (init, application, teardown) across all registered components.
	 * @param nodeLoggingComponentType The node logging component type to log any errors that occur.
	 * @returns A promise that resolves when the lifecycle is complete and the next check is scheduled.
	 * @internal
	 */
	private async checkApplicationHealth(nodeLoggingComponentType?: string): Promise<void> {
		this.stopApplicationTimer();

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
				const engineContextIds = engineCore.getContextIds() ?? {};
				const registeredInstances = await engineCore.getRegisteredComponents();

				// Pass 1: Init - providers populate healthContextIds with any IDs they establish
				const healthContextIds: IContextIds = {
					// Only use Node from the main engine context.
					// All other keys should be provided by healthApplicationInit of each component
					// as we don't want to use real ids.
					[ContextIdKeys.Node]: engineContextIds[ContextIdKeys.Node]
				};
				for (const registeredInstance of registeredInstances) {
					if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
						const initMethod = registeredInstance.component.healthApplicationInit?.bind(
							registeredInstance.component
						);
						if (Is.function(initMethod)) {
							try {
								await initMethod(healthContextIds);
							} catch (error) {
								const nodeLogging =
									ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
								await nodeLogging?.log({
									level: "error",
									source: HealthService.CLASS_NAME,
									message: "componentHealthApplicationInitFailed",
									data: { className: registeredInstance.component.className() },
									error: BaseError.fromError(error)
								});
							}
						}
					}
				}

				// Pass 2: Application health check wrapped in combined engine + init context
				const allHealth: IHealth[] = [];
				const lazyPromises: Promise<void>[] = [];

				await ContextIdStore.run(healthContextIds, async () => {
					for (const registeredInstance of registeredInstances) {
						if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
							const healthMethod = registeredInstance.component.healthApplication?.bind(
								registeredInstance.component
							);
							if (Is.function(healthMethod)) {
								let fired = false;
								let callback: HealthApplicationCallback = async () => {};
								const lazyPromise = new Promise<void>(resolve => {
									callback = async (result: IHealth[]) => {
										if (!fired) {
											fired = true;
											allHealth.push(...result);
											resolve();
										}
									};
								});

								try {
									const result = await healthMethod(callback);
									// undefined result indicates that the component will provide the
									// result asynchronously via the callback
									if (Is.undefined(result)) {
										lazyPromises.push(lazyPromise);
									} else {
										allHealth.push(...result);
									}
								} catch (error) {
									const nodeLogging =
										ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
									await nodeLogging?.log({
										level: "error",
										source: HealthService.CLASS_NAME,
										message: "componentHealthApplicationCheckFailed",
										data: { className: registeredInstance.component.className() },
										error: BaseError.fromError(error)
									});
								}
							}
						}
					}
				});

				// Wait for all deferred callbacks before proceeding to teardown
				if (lazyPromises.length > 0) {
					await Promise.allSettled(lazyPromises);
				}

				// Pass 3: Teardown wrapped in combined engine + init context
				await ContextIdStore.run(healthContextIds, async () => {
					for (const registeredInstance of registeredInstances.slice().reverse()) {
						if (Is.object<IHealthProviderComponent>(registeredInstance.component)) {
							const teardownMethod = registeredInstance.component.healthApplicationTeardown?.bind(
								registeredInstance.component
							);
							if (Is.function(teardownMethod)) {
								try {
									await teardownMethod();
								} catch (error) {
									const nodeLogging =
										ComponentFactory.getIfExists<ILoggingComponent>(nodeLoggingComponentType);
									await nodeLogging?.log({
										level: "error",
										source: HealthService.CLASS_NAME,
										message: "componentHealthApplicationTeardownFailed",
										data: { className: registeredInstance.component.className() },
										error: BaseError.fromError(error)
									});
								}
							}
						}
					}
				});

				this._applicationComponents = allHealth;
				this.groupHealthByName([...this._regularComponents, ...this._applicationComponents]);
				this.startApplicationTimer(nodeLoggingComponentType, this._healthApplicationCheckInterval);
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
	 * Start the regular health check timer.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @param interval The interval for the timer.
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
	 * Stop the regular health check timer.
	 * @internal
	 */
	private stopTimer(): void {
		if (this._healthTimer) {
			globalThis.clearTimeout(this._healthTimer);
			this._healthTimer = undefined;
		}
	}

	/**
	 * Start the application health lifecycle timer.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @param interval The interval for the timer.
	 * @internal
	 */
	private startApplicationTimer(
		nodeLoggingComponentType: string | undefined,
		interval: number
	): void {
		if (this._started) {
			this._healthApplicationTimer = globalThis.setTimeout(
				async () => this.checkApplicationHealth(nodeLoggingComponentType),
				interval
			);
		}
	}

	/**
	 * Stop the application health lifecycle timer.
	 * @internal
	 */
	private stopApplicationTimer(): void {
		if (this._healthApplicationTimer) {
			globalThis.clearTimeout(this._healthApplicationTimer);
			this._healthApplicationTimer = undefined;
		}
	}
}
