// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus, type IHealth } from "@twin.org/api-models";
import type { IContextIds } from "@twin.org/context";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Factory } from "@twin.org/core";
import { HealthService } from "../src/healthService.js";

function makeComponent(...healthEntries: IHealth[]): {
	component: { className: () => string; health: (lastTimestamp: number) => Promise<IHealth[]> };
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

		describe("three-pass cycle", () => {
			test("calls healthInit, health, healthTeardown in order", async () => {
				const callOrder: string[] = [];
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit: vi.fn().mockImplementation(async () => {
								callOrder.push("init");
							}),
							health: vi.fn().mockImplementation(async () => {
								callOrder.push("health");
								return [];
							}),
							healthTeardown: vi.fn().mockImplementation(async () => {
								callOrder.push("teardown");
							})
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(callOrder).toEqual(["init", "health", "teardown"]);
			});

			test("passes 0 as lastTimestamp on the first cycle", async () => {
				const healthInit = vi.fn().mockResolvedValue(undefined);
				const health = vi.fn().mockResolvedValue([]);
				const healthTeardown = vi.fn().mockResolvedValue(undefined);
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit,
							health,
							healthTeardown
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(healthInit).toHaveBeenCalledWith(0, expect.any(Object));
				expect(health).toHaveBeenCalledWith(0);
				expect(healthTeardown).toHaveBeenCalledWith(0);
			});

			test("passes the timestamp of the previous cycle on subsequent cycles", async () => {
				vi.setSystemTime(new Date(1000));
				const healthInit = vi.fn().mockResolvedValue(undefined);
				const health = vi.fn().mockResolvedValue([]);
				const healthTeardown = vi.fn().mockResolvedValue(undefined);
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit,
							health,
							healthTeardown
						}
					}
				]);

				const service = new HealthService();
				// First cycle fires at t=1000+2000=3000, records _lastTimestamp=3000
				await service.start();
				await vi.advanceTimersByTimeAsync(3000);
				expect(healthInit).toHaveBeenNthCalledWith(1, 0, expect.any(Object));
				expect(health).toHaveBeenNthCalledWith(1, 0);
				expect(healthTeardown).toHaveBeenNthCalledWith(1, 0);

				// Second cycle fires at t=3000+60000=63000, receives lastTimestamp=3000
				await vi.advanceTimersByTimeAsync(60000);
				expect(healthInit).toHaveBeenNthCalledWith(2, 3000, expect.any(Object));
				expect(health).toHaveBeenNthCalledWith(2, 3000);
				expect(healthTeardown).toHaveBeenNthCalledWith(2, 3000);
			});

			test("combines engine context IDs with those gathered during init", async () => {
				mockGetContextIds.mockReturnValue({ [ContextIdKeys.Node]: "n1" });
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit: vi.fn().mockImplementation(async (...args: [number, IContextIds]) => {
								args[1].session = "s1";
							}),
							health: vi.fn().mockResolvedValue([])
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

			test("wraps teardown in the same combined context as health", async () => {
				mockGetContextIds.mockReturnValue({ [ContextIdKeys.Node]: "n1" });
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit: vi.fn().mockImplementation(async (...args: [number, IContextIds]) => {
								args[1].session = "s1";
							}),
							health: vi.fn().mockResolvedValue([]),
							healthTeardown: vi.fn().mockResolvedValue(undefined)
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

			test("healthInit error does not prevent health from running", async () => {
				const health = vi.fn().mockResolvedValue([{ source: "db", status: HealthStatus.Ok }]);
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							healthInit: vi.fn().mockRejectedValue(new Error("init failed")),
							health
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect(health).toHaveBeenCalled();
				expect((await service.healthStatus()).components[0].source).toBe("db");
			});

			test("healthTeardown error does not affect the collected health result", async () => {
				mockGetRegisteredComponents.mockResolvedValue([
					{
						component: {
							className: vi.fn().mockReturnValue("MockComponent"),
							health: vi.fn().mockResolvedValue([{ source: "db", status: HealthStatus.Ok }]),
							healthTeardown: vi.fn().mockRejectedValue(new Error("teardown failed"))
						}
					}
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect((await service.healthStatus()).components[0].source).toBe("db");
			});

			test("health runs when component has no healthInit or healthTeardown", async () => {
				mockGetRegisteredComponents.mockResolvedValue([
					makeComponent({ source: "db", status: HealthStatus.Ok })
				]);

				const service = new HealthService();
				await startAndTick(service);

				expect((await service.healthStatus()).components[0].source).toBe("db");
			});
		});
	});

	describe("stop", () => {
		test("clears the interval so health is no longer updated", async () => {
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
