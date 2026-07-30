// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
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
});
