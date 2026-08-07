// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus, type IHealth } from "@twin.org/api-models";
import type { IContextIds } from "@twin.org/context";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Factory } from "@twin.org/core";
import { HealthService } from "../src/healthService.js";

function makeComponent(...healthEntries: IHealth[]): {
	component: { className: () => string; health: () => Promise<IHealth[]> };
} {
	return {
		component: {
			className: vi.fn().mockReturnValue("MockComponent"),
			health: vi.fn().mockResolvedValue(healthEntries)
		}
	};
}

describe("HealthService", () => {
	let mockGetContextIds: ReturnType<typeof vi.fn>;
	let mockGetRegisteredComponents: ReturnType<typeof vi.fn>;
	let mockEngineCore: {
		getContextIds: ReturnType<typeof vi.fn>;
		getRegisteredComponents: ReturnType<typeof vi.fn>;
	};
	let mockFactory: Factory<unknown>;

	beforeEach(() => {
		vi.restoreAllMocks();
		vi.useFakeTimers();

		mockGetContextIds = vi.fn().mockReturnValue({});
		mockGetRegisteredComponents = vi.fn().mockResolvedValue([]);
		mockEngineCore = {
			getContextIds: mockGetContextIds,
			getRegisteredComponents: mockGetRegisteredComponents
		};
		mockFactory = {
			getIfExists: vi.fn().mockReturnValue(mockEngineCore)
		} as unknown as Factory<unknown>;

		vi.spyOn(Factory, "getFactory").mockReturnValue(mockFactory);
		vi.spyOn(ContextIdStore, "run").mockImplementation(async (contextIds, fn) => fn());
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("constructor", () => {
		test("creates an instance with no options", () => {
			expect(new HealthService()).toBeDefined();
		});

		test("creates an instance with custom healthCheckInterval", () => {
			expect(new HealthService({ config: { healthCheckInterval: 60000 } })).toBeDefined();
		});

		test("creates an instance with custom healthCheckApplicationInterval", () => {
			expect(
				new HealthService({ config: { healthCheckApplicationInterval: 300000 } })
			).toBeDefined();
		});
	});

	describe("className", () => {
		test("returns HealthService", () => {
			expect(new HealthService().className()).toBe("HealthService");
		});
	});

	describe("healthStatus", () => {
		test("returns ok with empty components before any interval fires", async () => {
			const service = new HealthService();
			const result = await service.healthStatus();
			expect(result.status).toBe(HealthStatus.Ok);
			expect(result.components).toEqual([]);
		});
	});

	describe("start", () => {
		async function startAndTick(service: HealthService): Promise<void> {
			await service.start();
			await vi.advanceTimersByTimeAsync(30000);
		}

		test("does not collect health when no engine core factory is registered", async () => {
			vi.spyOn(Factory, "getFactory").mockReturnValue(undefined);
			const service = new HealthService();
			await startAndTick(service);
			expect((await service.healthStatus()).components).toEqual([]);
		});

		test("collects health from registered components", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent({ source: "db", status: HealthStatus.Ok })
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components } = await service.healthStatus();
			expect(components).toHaveLength(1);
			expect(components[0].source).toBe("db");
			expect(components[0].status).toBe(HealthStatus.Ok);
		});

		test("passes a single entry through unchanged without a grouped field", async () => {
			const entry: IHealth = {
				source: "cache",
				status: HealthStatus.Ok,
				description: "Cache health"
			};
			mockGetRegisteredComponents.mockResolvedValue([makeComponent(entry)]);

			const service = new HealthService();
			await startAndTick(service);

			const { components } = await service.healthStatus();
			expect(components[0]).toEqual(entry);
			expect(components[0].grouped).toBeUndefined();
		});

		test("groups entries with the same name under a single parent", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "storage", status: HealthStatus.Ok, description: "Primary" },
					{ source: "storage", status: HealthStatus.Ok, description: "Replica" }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components } = await service.healthStatus();
			expect(components).toHaveLength(1);
			expect(components[0].source).toBe("storage");
			expect(components[0].grouped).toHaveLength(2);
		});

		test("grouped parent status is error when any child has error", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "storage", status: HealthStatus.Ok },
					{ source: "storage", status: HealthStatus.Error }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components, status } = await service.healthStatus();
			expect(components[0].status).toBe(HealthStatus.Error);
			expect(status).toBe(HealthStatus.Error);
		});

		test("grouped parent status is warning when any child has warning and none have error", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "storage", status: HealthStatus.Ok },
					{ source: "storage", status: HealthStatus.Warning }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components, status } = await service.healthStatus();
			expect(components[0].status).toBe(HealthStatus.Warning);
			expect(status).toBe(HealthStatus.Warning);
		});

		test("grouped parent status is ok when all children are ok", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "storage", status: HealthStatus.Ok },
					{ source: "storage", status: HealthStatus.Ok }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components, status } = await service.healthStatus();
			expect(components[0].status).toBe(HealthStatus.Ok);
			expect(status).toBe(HealthStatus.Ok);
		});

		test("error takes priority over warning in grouped parent status", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "storage", status: HealthStatus.Warning },
					{ source: "storage", status: HealthStatus.Error }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components } = await service.healthStatus();
			expect(components[0].status).toBe(HealthStatus.Error);
		});

		test("entries with distinct names are not grouped", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent(
					{ source: "db", status: HealthStatus.Ok },
					{ source: "cache", status: HealthStatus.Ok }
				)
			]);

			const service = new HealthService();
			await startAndTick(service);

			const { components } = await service.healthStatus();
			expect(components).toHaveLength(2);
			expect(components.every(c => c.grouped === undefined)).toBe(true);
		});

		test("overall status is error when any top-level component is errored", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent({ source: "db", status: HealthStatus.Error })
			]);

			const service = new HealthService();
			await startAndTick(service);

			expect((await service.healthStatus()).status).toBe(HealthStatus.Error);
		});

		test("overall status is warning when a component has warning and none have error", async () => {
			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent({ source: "db", status: HealthStatus.Warning })
			]);

			const service = new HealthService();
			await startAndTick(service);

			expect((await service.healthStatus()).status).toBe(HealthStatus.Warning);
		});

		describe("application health cycle", () => {
			test("calls healthApplicationInit, healthApplication, healthApplicationTeardown in order", async () => {
				const callOrder: string[] = [];
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplicationInit: vi.fn().mockImplementation(async () => {
								callOrder.push("init");
							}),
							healthApplication: vi.fn().mockImplementation(async () => {
								callOrder.push("application");
								return [];
							}),
							healthApplicationTeardown: vi.fn().mockImplementation(async () => {
								callOrder.push("teardown");
							})
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(callOrder).toEqual(["init", "application", "teardown"]);
			});

			test("calls healthApplicationTeardown in reverse registration order", async () => {
				const teardownOrder: string[] = [];
				mockGetRegisteredComponents.mockResolvedValue(
					["A", "B", "C"].map(name => ({
						component: {
							className: vi.fn().mockReturnValue(name),
							healthApplication: vi.fn().mockResolvedValue([]),
							healthApplicationTeardown: vi.fn().mockImplementation(async () => {
								teardownOrder.push(name);
							})
						}
					}))
				);

				const service = new HealthService();
				await startAndTick(service);

				expect(teardownOrder).toEqual(["C", "B", "A"]);
			});

			test("combines engine context IDs with those gathered during init", async () => {
				mockGetContextIds.mockReturnValue({ [ContextIdKeys.Node]: "n1" });
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplicationInit: vi.fn().mockImplementation(async (...args: [IContextIds]) => {
								args[0].session = "s1";
							}),
							healthApplication: vi.fn().mockResolvedValue([])
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(ContextIdStore.run).toHaveBeenCalledWith(
					{ [ContextIdKeys.Node]: "n1", session: "s1" },
					expect.any(Function)
				);
			});

			test("wraps teardown in the same combined context as application health", async () => {
				mockGetContextIds.mockReturnValue({ [ContextIdKeys.Node]: "n1" });
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplicationInit: vi.fn().mockImplementation(async (...args: [IContextIds]) => {
								args[0].session = "s1";
							}),
							healthApplication: vi.fn().mockResolvedValue([]),
							healthApplicationTeardown: vi.fn().mockResolvedValue(undefined)
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				const runCalls = vi.mocked(ContextIdStore.run).mock.calls;
				expect(runCalls).toHaveLength(2);
				expect(runCalls[0][0]).toEqual({ [ContextIdKeys.Node]: "n1", session: "s1" });
				expect(runCalls[1][0]).toEqual({ [ContextIdKeys.Node]: "n1", session: "s1" });
			});

			test("healthApplicationInit error does not prevent healthApplication from running", async () => {
				const healthApplication = vi
					.fn()
					.mockResolvedValue([{ source: "db", status: HealthStatus.Ok }]);
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplicationInit: vi.fn().mockRejectedValue(new Error("init failed")),
							healthApplication
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(healthApplication).toHaveBeenCalled();
				expect((await service.healthStatus()).components[0].source).toBe("db");
			});

			test("healthApplicationTeardown error does not affect the collected health result", async () => {
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplication: vi
								.fn()
								.mockResolvedValue([{ source: "db", status: HealthStatus.Ok }]),
							healthApplicationTeardown: vi.fn().mockRejectedValue(new Error("teardown failed"))
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect((await service.healthStatus()).components[0].source).toBe("db");
			});

			test("healthApplication runs when component has no healthApplicationInit or healthApplicationTeardown", async () => {
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthApplication: vi
								.fn()
								.mockResolvedValue([{ source: "db", status: HealthStatus.Ok }])
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect((await service.healthStatus()).components[0].source).toBe("db");
			});

			describe("lazy healthApplication (returns undefined, uses callback)", () => {
				test("result from lazy callback is included in the health status", async () => {
					mockGetRegisteredComponents.mockResolvedValue([
						{
							component: {
								className: vi.fn().mockReturnValue("MockComponent"),
								healthApplication: vi
									.fn()
									.mockImplementation(async (callback: (r: IHealth[]) => void) => {
										callback([{ source: "lazy", status: HealthStatus.Ok }]);
										return undefined;
									})
							}
						}
					]);

					const service = new HealthService();
					await startAndTick(service);

					const { components } = await service.healthStatus();
					expect(components.some(c => c.source === "lazy")).toBe(true);
				});

				test("teardown runs after the lazy callback fires", async () => {
					const callOrder: string[] = [];

					mockGetRegisteredComponents.mockResolvedValue([
						{
							component: {
								className: vi.fn().mockReturnValue("MockComponent"),
								healthApplication: vi
									.fn()
									.mockImplementation(async (callback: (r: IHealth[]) => void) => {
										callback([]);
										callOrder.push("callback");
										return undefined;
									}),
								healthApplicationTeardown: vi.fn().mockImplementation(async () => {
									callOrder.push("teardown");
								})
							}
						}
					]);

					const service = new HealthService();
					await startAndTick(service);

					expect(callOrder).toEqual(["callback", "teardown"]);
				});

				test("second and subsequent callback invocations are ignored", async () => {
					mockGetRegisteredComponents.mockResolvedValue([
						{
							component: {
								className: vi.fn().mockReturnValue("MockComponent"),
								healthApplication: vi
									.fn()
									.mockImplementation(async (callback: (r: IHealth[]) => void) => {
										callback([{ source: "first", status: HealthStatus.Ok }]);
										callback([{ source: "second", status: HealthStatus.Ok }]);
										return undefined;
									})
							}
						}
					]);

					const service = new HealthService();
					await startAndTick(service);

					const { components } = await service.healthStatus();
					expect(components.some(c => c.source === "first")).toBe(true);
					expect(components.some(c => c.source === "second")).toBe(false);
				});
			});

			test("combines results from both the regular and application health timers", async () => {
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							health: vi
								.fn()
								.mockResolvedValue([{ source: "connectivity", status: HealthStatus.Ok }]),
							healthApplication: vi
								.fn()
								.mockResolvedValue([{ source: "application", status: HealthStatus.Ok }])
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				const { components } = await service.healthStatus();
				const sources = components.map(c => c.source);
				expect(sources).toContain("connectivity");
				expect(sources).toContain("application");
			});
		});
	});

	describe("stop", () => {
		test("clears both timers so health is no longer updated", async () => {
			const service = new HealthService();
			await service.start();
			await service.stop();

			mockGetRegisteredComponents.mockResolvedValue([
				makeComponent({ source: "db", status: HealthStatus.Error })
			]);
			await vi.advanceTimersByTimeAsync(30000);

			expect((await service.healthStatus()).components).toEqual([]);
		});
	});
});
