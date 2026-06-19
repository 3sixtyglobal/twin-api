// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpContextIdKeys, type ITenant } from "@twin.org/api-models";
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
	label: "Tenant A",
	organizationId: "org-1"
};

const TENANT_B: ITenant = {
	id: "tenant-B",
	apiKey: "key-B",
	publicOrigin: "https://b.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant B",
	organizationId: "org-2"
};

const TENANT_C: ITenant = {
	id: "tenant-C",
	apiKey: "key-C",
	publicOrigin: "https://c.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant C",
	organizationId: "org-3"
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

	describe("getLocalOriginContext", () => {
		beforeEach(() => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});
		});

		it("should throw when url is empty", async () => {
			const service = new PlatformService();
			await expect(service.getLocalOriginContext("")).rejects.toThrow();
		});

		it("should return undefined when the url has no parseable origin", async () => {
			const service = new PlatformService();
			await expect(service.getLocalOriginContext("not-a-valid-url")).resolves.toBeUndefined();
		});

		it("should return contextIds when url origin matches the context publicOrigin without querying storage", async () => {
			const contextIds = { [HttpContextIdKeys.PublicOrigin]: "https://example.com" };
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds);
			const service = new PlatformService();
			await expect(service.getLocalOriginContext("https://example.com/some/path")).resolves.toBe(
				contextIds
			);
			expect(mockTenantStorage.query).not.toHaveBeenCalled();
		});

		it("should return contextIds when url origin matches the context localOrigin without querying storage", async () => {
			const contextIds = { [HttpContextIdKeys.LocalOrigin]: "https://local.example.com" };
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds);
			const service = new PlatformService();
			await expect(
				service.getLocalOriginContext("https://local.example.com/some/path")
			).resolves.toBe(contextIds);
			expect(mockTenantStorage.query).not.toHaveBeenCalled();
		});

		it("should return undefined when origin matches neither context nor any tenant", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
				[HttpContextIdKeys.PublicOrigin]: "https://other.com"
			});
			(mockTenantStorage.query as ReturnType<typeof vi.fn>).mockResolvedValue({ entities: [] });
			const service = new PlatformService();
			await expect(
				service.getLocalOriginContext("https://example.com/path")
			).resolves.toBeUndefined();
		});

		it("should return contextIds with tenant info when a tenant's publicOrigin matches the url origin", async () => {
			const service = new PlatformService();
			const result = await service.getLocalOriginContext("https://b.example.com/page");
			expect(result).toMatchObject({
				[ContextIdKeys.Tenant]: TENANT_B.id,
				[ContextIdKeys.Organization]: TENANT_B.organizationId,
				[HttpContextIdKeys.PublicOrigin]: TENANT_B.publicOrigin
			});
		});

		it("should follow cursor pagination and return contextIds when a match is on a later page", async () => {
			(mockTenantStorage.query as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({ entities: [TENANT_A], cursor: "page2" })
				.mockResolvedValueOnce({ entities: [TENANT_B] });
			const service = new PlatformService();
			const result = await service.getLocalOriginContext("https://b.example.com/page");
			expect(result).toMatchObject({
				[ContextIdKeys.Tenant]: TENANT_B.id,
				[ContextIdKeys.Organization]: TENANT_B.organizationId,
				[HttpContextIdKeys.PublicOrigin]: TENANT_B.publicOrigin
			});
			expect(mockTenantStorage.query).toHaveBeenCalledTimes(2);
		});

		it("should return undefined when no page contains a matching tenant", async () => {
			(mockTenantStorage.query as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({ entities: [TENANT_A], cursor: "page2" })
				.mockResolvedValueOnce({ entities: [TENANT_B] });
			const service = new PlatformService();
			await expect(
				service.getLocalOriginContext("https://unknown.example.com/")
			).resolves.toBeUndefined();
			expect(mockTenantStorage.query).toHaveBeenCalledTimes(2);
		});

		it("should skip tenants with no publicOrigin and still match a later tenant", async () => {
			const tenantNoOrigin = { ...TENANT_A, publicOrigin: undefined };
			(mockTenantStorage.query as ReturnType<typeof vi.fn>).mockResolvedValue({
				entities: [tenantNoOrigin, TENANT_B]
			});
			const service = new PlatformService();
			const result = await service.getLocalOriginContext("https://b.example.com/");
			expect(result).toMatchObject({
				[ContextIdKeys.Tenant]: TENANT_B.id,
				[ContextIdKeys.Organization]: TENANT_B.organizationId,
				[HttpContextIdKeys.PublicOrigin]: TENANT_B.publicOrigin
			});
		});
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
