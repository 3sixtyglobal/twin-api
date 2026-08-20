// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	HealthApplicationCallback,
	IHealth,
	IHealthProviderComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import type { IContextIds } from "@twin.org/context";
import { Is } from "@twin.org/core";
import type { IComponent } from "@twin.org/core";
import { ModuleHelper } from "@twin.org/modules";

/**
 * Execute the application health lifecycle (init, application, teardown) across all registered
 * components. Called by the background task framework in a worker thread; the engine clone data
 * is used to initialise a local clone of the engine so component factories are available.
 * @param engineCloneData The engine clone data supplied automatically by the background task framework.
 * @returns The health entries collected across all three passes.
 */
export async function checkApplicationHealth(engineCloneData: unknown): Promise<IHealth[]> {
	if (Is.empty(engineCloneData)) {
		return [];
	}

	// Use inline type to avoid circular dependency with engine-core package
	const engine = await ModuleHelper.execModuleMethod<{
		start: () => Promise<void>;
		stop: () => Promise<void>;
		getContextIds: () => IContextIds | undefined;
		getRegisteredComponents: () => Promise<{ instanceType: string; component: IComponent }[]>;
	}>("@twin.org/engine-core", "EngineCoreBuilder.fromClone", [
		"engine",
		engineCloneData,
		await ContextIdStore.getContextIds(),
		{ logLevel: "error" }
	]);

	try {
		await engine.start();

		const engineContextIds = engine.getContextIds() ?? {};
		const registeredInstances = await engine.getRegisteredComponents();

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
					await initMethod(healthContextIds);
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

						const result = await healthMethod(callback);
						// undefined result indicates that the component will provide the
						// result asynchronously via the callback
						if (Is.undefined(result)) {
							lazyPromises.push(lazyPromise);
						} else {
							allHealth.push(...result);
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
						await teardownMethod();
					}
				}
			}
		});

		return allHealth;
	} finally {
		await engine.stop();
	}
}
