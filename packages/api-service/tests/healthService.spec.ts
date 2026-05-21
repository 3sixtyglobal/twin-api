// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdStore } from "@twin.org/context";
import { HealthStatus, type IHealth } from "@twin.org/core";
import { EngineCoreFactory } from "@twin.org/engine-models";
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
	let mockEngineCore: NonNullable<ReturnType<typeof EngineCoreFactory.getIfExists>>;

	beforeEach(() => {
		vi.restoreAllMocks();
		vi.useFakeTimers();

		mockGetContextIds = vi.fn().mockReturnValue({});
		mockGetRegisteredComponents = vi.fn().mockResolvedValue([]);
		mockEngineCore = {
			getContextIds: mockGetContextIds,
			getRegisteredComponents: mockGetRegisteredComponents
		} as unknown as NonNullable<ReturnType<typeof EngineCoreFactory.getIfExists>>;

		vi.spyOn(EngineCoreFactory, "getIfExists").mockReturnValue(mockEngineCore);
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

		test("does not collect health when no engine core is registered", async () => {
			vi.spyOn(EngineCoreFactory, "getIfExists").mockReturnValue(undefined);
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
