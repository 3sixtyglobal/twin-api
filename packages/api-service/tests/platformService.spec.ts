// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenant } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { PlatformService } from "../src/platformService.js";

const TENANT_A: ITenant = {
	id: "tenant-A",
	apiKey: "key-A",
	publicOrigin: "https://a.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant A"
};

const TENANT_B: ITenant = {
	id: "tenant-B",
	apiKey: "key-B",
	publicOrigin: "https://b.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant B"
};

const TENANT_C: ITenant = {
	id: "tenant-C",
	apiKey: "key-C",
	publicOrigin: "https://c.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant C"
};

describe("PlatformService", () => {
	let mockTenantStorage: IEntityStorageConnector<ITenant>;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn(),
			remove: vi.fn(),
			query: vi.fn().mockResolvedValue({
				entities: [TENANT_A, TENANT_B, TENANT_C]
			})
		} as unknown as IEntityStorageConnector<ITenant>;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
	});

	describe("execute", () => {
		it("should not mutate the caller's active request context", async () => {
			const service = new PlatformService({ config: { isMultiTenant: true } });
			const requestContextIds = {
				[ContextIdKeys.Tenant]: TENANT_A.id,
				[ContextIdKeys.User]: "user-1"
			};

			await ContextIdStore.run(requestContextIds, async () => {
				await service.execute(async () => {
					// Simulate per-tenant background work (e.g. spread logging to all partitions).
				});

				const afterContextIds = await ContextIdStore.getContextIds();
				expect(afterContextIds?.[ContextIdKeys.Tenant]).toBe(TENANT_A.id);
				expect(afterContextIds?.[ContextIdKeys.User]).toBe("user-1");
			});
		});

		it("should preserve tenant for subsequent operations in the same request", async () => {
			const service = new PlatformService({ config: { isMultiTenant: true } });
			let partitionTenantAfterRun: string | undefined;

			await ContextIdStore.run({ [ContextIdKeys.Tenant]: TENANT_A.id }, async () => {
				expect((await ContextIdStore.getContextIds())?.[ContextIdKeys.Tenant]).toBe(TENANT_A.id);

				// Simulate a deferred per-tenant flush invoked mid-request (e.g. batched logging).
				await service.execute(async () => {});

				partitionTenantAfterRun = (await ContextIdStore.getContextIds())?.[ContextIdKeys.Tenant];
			});

			expect(partitionTenantAfterRun).toBe(TENANT_A.id);
		});

		it("should run the method under each tenant's context in turn", async () => {
			const service = new PlatformService({ config: { isMultiTenant: true } });
			const seenTenants: (string | undefined)[] = [];

			await ContextIdStore.run({ [ContextIdKeys.Tenant]: TENANT_A.id }, async () => {
				await service.execute(async () => {
					seenTenants.push((await ContextIdStore.getContextIds())?.[ContextIdKeys.Tenant]);
				});
			});

			expect(seenTenants).toEqual([TENANT_A.id, TENANT_B.id, TENANT_C.id]);
		});
	});
});
