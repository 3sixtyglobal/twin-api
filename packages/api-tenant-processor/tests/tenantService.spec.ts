// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { Tenant } from "../src/entities/tenant.js";
import { TenantService } from "../src/tenantService.js";

const TENANT_A: Tenant = {
	id: "tenant-A",
	apiKey: "key-A",
	publicOrigin: "https://a.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant A"
};

const TENANT_B: Tenant = {
	id: "tenant-B",
	apiKey: "key-B",
	publicOrigin: "https://b.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant B"
};

const TENANT_C: Tenant = {
	id: "tenant-C",
	apiKey: "key-C",
	publicOrigin: "https://c.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant C"
};

describe("TenantService", () => {
	let mockTenantStorage: IEntityStorageConnector<Tenant>;

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
		} as unknown as IEntityStorageConnector<Tenant>;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
	});

	describe("runPerTenant", () => {
		it("should not mutate the caller's active request context", async () => {
			const service = new TenantService();
			const requestContextIds = {
				[ContextIdKeys.Tenant]: TENANT_A.id,
				[ContextIdKeys.User]: "user-1"
			};

			await ContextIdStore.run(requestContextIds, async () => {
				await service.runPerTenant(async () => {
					// Simulate per-tenant background work (e.g. spread logging to all partitions).
				});

				const afterContextIds = await ContextIdStore.getContextIds();
				expect(afterContextIds?.[ContextIdKeys.Tenant]).toBe(TENANT_A.id);
				expect(afterContextIds?.[ContextIdKeys.User]).toBe("user-1");
			});
		});

		it("should preserve tenant for subsequent operations in the same request", async () => {
			const service = new TenantService();
			let partitionTenantAfterRunPerTenant: string | undefined;

			await ContextIdStore.run({ [ContextIdKeys.Tenant]: TENANT_A.id }, async () => {
				expect((await ContextIdStore.getContextIds())?.[ContextIdKeys.Tenant]).toBe(TENANT_A.id);

				// Simulate a deferred per-tenant flush invoked mid-request (e.g. batched logging).
				await service.runPerTenant(async () => {});

				partitionTenantAfterRunPerTenant = (await ContextIdStore.getContextIds())?.[
					ContextIdKeys.Tenant
				];
			});

			expect(partitionTenantAfterRunPerTenant).toBe(TENANT_A.id);
		});

		it("should run the method under each tenant's context in turn", async () => {
			const service = new TenantService();
			const seenTenants: (string | undefined)[] = [];

			await ContextIdStore.run({ [ContextIdKeys.Tenant]: TENANT_A.id }, async () => {
				await service.runPerTenant(async () => {
					seenTenants.push((await ContextIdStore.getContextIds())?.[ContextIdKeys.Tenant]);
				});
			});

			expect(seenTenants).toEqual([TENANT_A.id, TENANT_B.id, TENANT_C.id]);
		});
	});
});
