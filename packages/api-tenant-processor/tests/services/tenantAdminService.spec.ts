// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthCategory, HealthStatus } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { AlreadyExistsError, NotFoundError } from "@twin.org/core";
import { ComparisonOperator } from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { Tenant } from "../../src/entities/tenant.js";
import { TenantAdminService } from "../../src/tenantAdminService.js";

const TENANT_ID = "01234567890123456789012345678901";
const OTHER_TENANT_ID = "99999999999999999999999999999999";
const API_KEY = "abcdef1234567890abcdef1234567890";
const ORG_ID = "org-original";
const OTHER_ORG_ID = "org-other";
const LEGACY_ORG_ID = "org-legacy";
const PUBLIC_ORIGIN = "https://node.example.org";
const OTHER_PUBLIC_ORIGIN = "https://other.example.org";

const EXISTING_TENANT: Tenant = {
	id: TENANT_ID,
	apiKey: API_KEY,
	label: "Original",
	publicOrigin: "https://node.example.org",
	organizationId: ORG_ID,
	dateCreated: "2026-01-01T00:00:00.000Z",
	dateModified: "2026-01-01T00:00:00.000Z"
};

describe("TenantAdminService", () => {
	let mockStorage: IEntityStorageConnector<Tenant>;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn().mockResolvedValue(undefined),
			remove: vi.fn(),
			query: vi.fn().mockResolvedValue({ entities: [] })
		} as unknown as IEntityStorageConnector<Tenant>;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockStorage);
	});

	describe("create", () => {
		it("should throw AlreadyExistsError when a tenant with the same id already exists", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.create({
					id: TENANT_ID,
					apiKey: API_KEY,
					label: "Someone Else",
					organizationId: OTHER_ORG_ID
				})
			).rejects.toThrow(AlreadyExistsError);
		});

		it("should throw AlreadyExistsError when publicOrigin is already in use by another tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (index === "publicOrigin" && id === PUBLIC_ORIGIN) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.create({
					apiKey: API_KEY,
					label: "New Tenant",
					organizationId: OTHER_ORG_ID,
					publicOrigin: PUBLIC_ORIGIN
				})
			).rejects.toThrow(AlreadyExistsError);
		});

		it("should throw AlreadyExistsError when organizationId is already in use by another tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (index === "organizationId" && id === ORG_ID) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.create({ apiKey: API_KEY, label: "New Tenant", organizationId: ORG_ID })
			).rejects.toThrow(AlreadyExistsError);
		});

		it("should succeed and return the generated id when no tenant with that id exists", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();
			const result = await service.create({
				apiKey: API_KEY,
				label: "New Tenant",
				organizationId: ORG_ID
			});

			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
			expect(mockStorage.set).toHaveBeenCalledOnce();
		});

		it("should use the caller-supplied id when one is provided", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();
			const result = await service.create({
				id: TENANT_ID,
				apiKey: API_KEY,
				label: "Named Tenant",
				organizationId: ORG_ID
			});

			expect(result).toBe(TENANT_ID);
		});
	});

	describe("update", () => {
		it("should throw AlreadyExistsError when publicOrigin is already used by another tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					if (index === "publicOrigin" && id === OTHER_PUBLIC_ORIGIN) {
						return { ...EXISTING_TENANT, id: OTHER_TENANT_ID, publicOrigin: OTHER_PUBLIC_ORIGIN };
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.update({ id: TENANT_ID, organizationId: ORG_ID, publicOrigin: OTHER_PUBLIC_ORIGIN })
			).rejects.toThrow(AlreadyExistsError);
		});

		it("should not throw when publicOrigin is unchanged on the same tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					if (index === "publicOrigin" && id === PUBLIC_ORIGIN) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.update({ id: TENANT_ID, organizationId: ORG_ID, publicOrigin: PUBLIC_ORIGIN })
			).resolves.toBeUndefined();
		});

		it("should throw AlreadyExistsError when organizationId is already used by another tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					if (index === "organizationId" && id === OTHER_ORG_ID) {
						return { ...EXISTING_TENANT, id: OTHER_TENANT_ID, organizationId: OTHER_ORG_ID };
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(service.update({ id: TENANT_ID, organizationId: OTHER_ORG_ID })).rejects.toThrow(
				AlreadyExistsError
			);
		});

		it("should not throw when organizationId is unchanged on the same tenant", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					if (index === "organizationId" && id === ORG_ID) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();

			await expect(
				service.update({ id: TENANT_ID, organizationId: ORG_ID, label: "Updated" })
			).resolves.toBeUndefined();
		});

		it("should move old organizationId into legacy when organizationId changes", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();
			await service.update({ id: TENANT_ID, organizationId: OTHER_ORG_ID });

			expect(mockStorage.set).toHaveBeenCalledWith(
				expect.objectContaining({
					organizationId: OTHER_ORG_ID,
					organizationIdLegacy: `|${ORG_ID}|`
				})
			);
		});

		it("should remove new organizationId from legacy if it was previously in the legacy array", async () => {
			const tenantWithLegacy: Tenant = {
				...EXISTING_TENANT,
				organizationIdLegacy: `|${LEGACY_ORG_ID}|`
			};

			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return tenantWithLegacy;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();
			await service.update({ id: TENANT_ID, organizationId: LEGACY_ORG_ID });

			expect(mockStorage.set).toHaveBeenCalledWith(
				expect.objectContaining({
					organizationId: LEGACY_ORG_ID,
					organizationIdLegacy: `|${ORG_ID}|`
				})
			);
		});

		it("should produce no legacy entry when moving to a new id with no prior legacy", async () => {
			const tenantNoLegacy: Tenant = { ...EXISTING_TENANT, organizationIdLegacy: undefined };

			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (!index && id === TENANT_ID) {
						return tenantNoLegacy;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();
			await service.update({ id: TENANT_ID, organizationId: OTHER_ORG_ID });

			expect(mockStorage.set).toHaveBeenCalledWith(
				expect.objectContaining({
					organizationId: OTHER_ORG_ID,
					organizationIdLegacy: `|${ORG_ID}|`
				})
			);
		});
	});

	describe("lookup error handling", () => {
		it("should throw NotFoundError from get when no tenant exists", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();

			await expect(service.get(TENANT_ID)).rejects.toThrow(NotFoundError);
		});

		it("should rethrow non-NotFound errors from get", async () => {
			const connectorError = new Error("connector unavailable");
			vi.mocked(mockStorage.get).mockRejectedValue(connectorError);

			const service = new TenantAdminService();

			await expect(service.get(TENANT_ID)).rejects.toThrow(connectorError);
		});

		it("should throw NotFoundError from getByApiKey when no tenant exists", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();

			await expect(service.getByApiKey(API_KEY)).rejects.toThrow(NotFoundError);
		});

		it("should rethrow non-NotFound errors from getByApiKey", async () => {
			const connectorError = new Error("connector unavailable");
			vi.mocked(mockStorage.get).mockRejectedValue(connectorError);

			const service = new TenantAdminService();

			await expect(service.getByApiKey(API_KEY)).rejects.toThrow(connectorError);
		});

		it("should throw NotFoundError from getByPublicOrigin when no tenant exists", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();

			await expect(service.getByPublicOrigin(PUBLIC_ORIGIN)).rejects.toThrow(NotFoundError);
		});

		it("should rethrow non-NotFound errors from getByPublicOrigin", async () => {
			const connectorError = new Error("connector unavailable");
			vi.mocked(mockStorage.get).mockRejectedValue(connectorError);

			const service = new TenantAdminService();

			await expect(service.getByPublicOrigin(PUBLIC_ORIGIN)).rejects.toThrow(connectorError);
		});
	});

	describe("getTenantByOrganizationId", () => {
		it("should return the tenant when found by primary organizationId", async () => {
			vi.mocked(mockStorage.get).mockImplementation(
				async (id: string, index?: string): Promise<Tenant | undefined> => {
					if (index === "organizationId" && id === ORG_ID) {
						return EXISTING_TENANT;
					}
					return undefined;
				}
			);

			const service = new TenantAdminService();
			const result = await service.getTenantByOrganizationId(ORG_ID);

			expect(result.id).toBe(TENANT_ID);
			expect(result.organizationId).toBe(ORG_ID);
		});

		it("should return the tenant when found in legacy with includeLegacy=true", async () => {
			const tenantWithLegacy: Tenant = {
				...EXISTING_TENANT,
				organizationId: OTHER_ORG_ID,
				organizationIdLegacy: `|${ORG_ID}|`
			};

			vi.mocked(mockStorage.get).mockResolvedValue(undefined);
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [tenantWithLegacy] });

			const service = new TenantAdminService();
			const result = await service.getTenantByOrganizationId(ORG_ID, true);

			expect(result.id).toBe(TENANT_ID);
		});

		it("should not search legacy when includeLegacy is not set", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);

			const service = new TenantAdminService();

			await expect(service.getTenantByOrganizationId(ORG_ID)).rejects.toThrow(NotFoundError);
			expect(mockStorage.query).not.toHaveBeenCalled();
		});

		it("should throw NotFoundError when not found even with includeLegacy=true", async () => {
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [] });

			const service = new TenantAdminService();

			await expect(service.getTenantByOrganizationId(ORG_ID, true)).rejects.toThrow(NotFoundError);
		});

		it("should rethrow non-NotFound errors from primary organization lookup", async () => {
			const connectorError = new Error("connector unavailable");
			vi.mocked(mockStorage.get).mockRejectedValue(connectorError);

			const service = new TenantAdminService();

			await expect(service.getTenantByOrganizationId(ORG_ID, true)).rejects.toThrow(connectorError);
			expect(mockStorage.query).not.toHaveBeenCalled();
		});
	});

	describe("query", () => {
		it("should return organizationIdLegacy as a string array rather than a pipe-delimited string", async () => {
			const tenantWithLegacy: Tenant = {
				...EXISTING_TENANT,
				organizationIdLegacy: `|${LEGACY_ORG_ID}|`
			};
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [tenantWithLegacy] });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.tenants[0].organizationIdLegacy).toEqual([LEGACY_ORG_ID]);
		});

		it("should return organizationIdLegacy as undefined when the entity has no legacy ids", async () => {
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [EXISTING_TENANT] });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.tenants[0].organizationIdLegacy).toBeUndefined();
		});

		it("should return multiple legacy ids as separate array elements", async () => {
			const tenantWithMultipleLegacy: Tenant = {
				...EXISTING_TENANT,
				organizationIdLegacy: `|${LEGACY_ORG_ID}|${OTHER_ORG_ID}|`
			};
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [tenantWithMultipleLegacy] });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.tenants[0].organizationIdLegacy).toEqual([LEGACY_ORG_ID, OTHER_ORG_ID]);
		});

		it("should pass through the cursor returned by the storage connector", async () => {
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [], cursor: "nextPage" });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.cursor).toBe("nextPage");
		});

		it("should return undefined cursor when no further pages exist", async () => {
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [] });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.cursor).toBeUndefined();
		});

		it("should forward conditions, properties, cursor, and limit to the storage connector", async () => {
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [] });

			const service = new TenantAdminService();
			await service.query(
				{ property: "organizationId", comparison: ComparisonOperator.Equals, value: ORG_ID },
				["id", "organizationId"],
				"cursor1",
				10
			);

			expect(mockStorage.query).toHaveBeenCalledWith(
				{ property: "organizationId", comparison: ComparisonOperator.Equals, value: ORG_ID },
				undefined,
				["id", "organizationId"],
				"cursor1",
				10
			);
		});

		it("should apply entityToModel to every entity in the result", async () => {
			const tenant1: Tenant = {
				...EXISTING_TENANT,
				id: TENANT_ID,
				organizationIdLegacy: `|${LEGACY_ORG_ID}|`
			};
			const tenant2: Tenant = {
				...EXISTING_TENANT,
				id: OTHER_TENANT_ID,
				organizationId: OTHER_ORG_ID,
				organizationIdLegacy: undefined
			};
			vi.mocked(mockStorage.query).mockResolvedValue({ entities: [tenant1, tenant2] });

			const service = new TenantAdminService();
			const result = await service.query();

			expect(result.tenants).toHaveLength(2);
			expect(result.tenants[0].organizationIdLegacy).toEqual([LEGACY_ORG_ID]);
			expect(result.tenants[1].organizationIdLegacy).toBeUndefined();
		});
	});

	describe("health lifecycle", () => {
		const HEALTH_ORG_ID = "org-health-check";
		let createdTenant: Tenant | undefined;

		beforeEach(() => {
			createdTenant = undefined;

			vi.mocked(mockStorage.set).mockImplementation(async entity => {
				createdTenant = entity as Tenant;
			});

			vi.mocked(mockStorage.get).mockImplementation(async (id: string, index?: string) => {
				if (!index && id === createdTenant?.id) {
					return createdTenant;
				}
				return undefined;
			});

			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(undefined);
		});

		it("healthApplicationInit creates a tenant using the organization ID from contextIds", async () => {
			const service = new TenantAdminService();
			const contextIds: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };

			await service.healthApplicationInit(contextIds);

			expect(mockStorage.set).toHaveBeenCalledOnce();
			expect(mockStorage.set).toHaveBeenCalledWith(
				expect.objectContaining({ organizationId: HEALTH_ORG_ID })
			);
			expect(contextIds[ContextIdKeys.Tenant]).toBeDefined();
			expect(typeof contextIds[ContextIdKeys.Tenant]).toBe("string");
		});

		it("healthApplicationInit skips provisioning when organization ID is absent from context", async () => {
			const service = new TenantAdminService();
			const contextIds: IContextIds = {};

			await service.healthApplicationInit(contextIds);

			expect(mockStorage.set).not.toHaveBeenCalled();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
		});

		it("healthApplication returns Ok when the provisioned tenant is retrieved", async () => {
			const service = new TenantAdminService();
			const contextIds: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };

			await service.healthApplicationInit(contextIds);
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds);
			const result = await service.healthApplication(vi.fn());

			expect(result).toHaveLength(1);
			expect(result?.[0].status).toBe(HealthStatus.Ok);
			expect(result?.[0].category).toBe(HealthCategory.Application);
			expect(result?.[0].source).toBe(TenantAdminService.CLASS_NAME);
		});

		it("healthApplication returns Error when the provisioned tenant cannot be retrieved", async () => {
			const service = new TenantAdminService();
			const contextIds: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };

			await service.healthApplicationInit(contextIds);
			vi.mocked(mockStorage.get).mockResolvedValue(undefined);
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds);
			const result = await service.healthApplication(vi.fn());

			expect(result?.[0].status).toBe(HealthStatus.Error);
			expect(result?.[0].category).toBe(HealthCategory.Application);
		});

		it("healthApplication returns empty when no tenant was provisioned", async () => {
			const service = new TenantAdminService();

			const result = await service.healthApplication(vi.fn());

			expect(result).toEqual([]);
		});

		it("healthApplicationTeardown removes the provisioned tenant", async () => {
			const service = new TenantAdminService();
			const contextIds: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };

			await service.healthApplicationInit(contextIds);
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds);
			await service.healthApplication(vi.fn());
			await service.healthApplicationTeardown();

			expect(mockStorage.remove).toHaveBeenCalledWith(contextIds[ContextIdKeys.Tenant]);
		});

		it("healthApplicationTeardown does nothing when no tenant was provisioned", async () => {
			const service = new TenantAdminService();

			await service.healthApplicationTeardown();

			expect(mockStorage.remove).not.toHaveBeenCalled();
		});

		it("healthApplicationTeardown clears the tenant ID so the next cycle can provision afresh", async () => {
			const service = new TenantAdminService();
			const contextIds1: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };

			await service.healthApplicationInit(contextIds1);
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue(contextIds1);
			await service.healthApplication(vi.fn());
			await service.healthApplicationTeardown();

			const contextIds2: IContextIds = { [ContextIdKeys.Organization]: HEALTH_ORG_ID };
			await service.healthApplicationInit(contextIds2);

			expect(mockStorage.set).toHaveBeenCalledTimes(2);
			expect(contextIds2[ContextIdKeys.Tenant]).toBeDefined();
		});
	});
});
