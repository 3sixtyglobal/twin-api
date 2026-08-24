// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus, type IHealth } from "@twin.org/api-models";
import type { IContextIds } from "@twin.org/context";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ModuleHelper } from "@twin.org/modules";
import { checkApplicationHealth } from "../src/healthApplicationTask.js";

const ENGINE_CLONE_DATA = { config: {} };

describe("healthApplicationTask", () => {
	let mockGetContextIds: ReturnType<typeof vi.fn>;
	let mockGetRegisteredComponents: ReturnType<typeof vi.fn>;
	let mockEngine: {
		start: ReturnType<typeof vi.fn>;
		stop: ReturnType<typeof vi.fn>;
		getContextIds: ReturnType<typeof vi.fn>;
		getRegisteredComponents: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.restoreAllMocks();

		mockGetContextIds = vi.fn().mockReturnValue({});
		mockGetRegisteredComponents = vi.fn().mockResolvedValue([]);
		mockEngine = {
			start: vi.fn().mockResolvedValue(undefined),
			stop: vi.fn().mockResolvedValue(undefined),
			getContextIds: mockGetContextIds,
			getRegisteredComponents: mockGetRegisteredComponents
		};

		vi.spyOn(ModuleHelper, "execModuleMethod").mockResolvedValue(mockEngine);
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});
		vi.spyOn(ContextIdStore, "run").mockImplementation(async (contextIds, fn) => fn());
	});

	test("returns empty array when engineCloneData is empty", async () => {
		expect(await checkApplicationHealth(undefined)).toEqual([]);
		expect(await checkApplicationHealth(null)).toEqual([]);
		expect(ModuleHelper.execModuleMethod).not.toHaveBeenCalled();
	});

	test("initialises the cloned engine from engineCloneData", async () => {
		await checkApplicationHealth(ENGINE_CLONE_DATA);

		expect(ModuleHelper.execModuleMethod).toHaveBeenCalledWith(
			"@twin.org/engine-core",
			"EngineCoreBuilder.fromClone",
			expect.arrayContaining(["engine", ENGINE_CLONE_DATA])
		);
		expect(mockEngine.start).toHaveBeenCalled();
	});

	test("stops the engine after the health cycle completes", async () => {
		await checkApplicationHealth(ENGINE_CLONE_DATA);
		expect(mockEngine.stop).toHaveBeenCalled();
	});

	test("stops the engine even when the health cycle throws", async () => {
		mockGetRegisteredComponents.mockRejectedValue(new Error("fail"));
		await expect(checkApplicationHealth(ENGINE_CLONE_DATA)).rejects.toThrow("fail");
		expect(mockEngine.stop).toHaveBeenCalled();
	});

	test("returns empty array when no components are registered", async () => {
		expect(await checkApplicationHealth(ENGINE_CLONE_DATA)).toEqual([]);
	});

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

		await checkApplicationHealth(ENGINE_CLONE_DATA);

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

		await checkApplicationHealth(ENGINE_CLONE_DATA);

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

		await checkApplicationHealth(ENGINE_CLONE_DATA);

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

		await checkApplicationHealth(ENGINE_CLONE_DATA);

		const runCalls = vi.mocked(ContextIdStore.run).mock.calls;
		expect(runCalls).toHaveLength(2);
		expect(runCalls[0][0]).toEqual({ [ContextIdKeys.Node]: "n1", session: "s1" });
		expect(runCalls[1][0]).toEqual({ [ContextIdKeys.Node]: "n1", session: "s1" });
	});

	test("healthApplication runs when component has no healthApplicationInit or healthApplicationTeardown", async () => {
		mockGetRegisteredComponents.mockResolvedValue([
			{
				component: {
					className: vi.fn().mockReturnValue("MockComponent"),
					healthApplication: vi.fn().mockResolvedValue([{ source: "db", status: HealthStatus.Ok }])
				}
			}
		]);

		const result = await checkApplicationHealth(ENGINE_CLONE_DATA);

		expect(result[0].source).toBe("db");
	});

	test("returns health entries from healthApplication", async () => {
		const entry: IHealth = { source: "db", status: HealthStatus.Ok };
		mockGetRegisteredComponents.mockResolvedValue([
			{
				component: {
					className: vi.fn().mockReturnValue("MockComponent"),
					healthApplication: vi.fn().mockResolvedValue([entry])
				}
			}
		]);

		const result = await checkApplicationHealth(ENGINE_CLONE_DATA);

		expect(result).toEqual([entry]);
	});

	describe("lazy healthApplication (returns undefined, uses callback)", () => {
		test("result from lazy callback is included in the returned health entries", async () => {
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

			const result = await checkApplicationHealth(ENGINE_CLONE_DATA);

			expect(result.some(r => r.source === "lazy")).toBe(true);
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

			await checkApplicationHealth(ENGINE_CLONE_DATA);

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

			const result = await checkApplicationHealth(ENGINE_CLONE_DATA);

			expect(result.some(r => r.source === "first")).toBe(true);
			expect(result.some(r => r.source === "second")).toBe(false);
		});
	});
});
