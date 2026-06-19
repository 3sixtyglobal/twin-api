// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenant, ITenantAdminComponent } from "@twin.org/api-models";
import { AlreadyExistsError, GeneralError, Guards, Is, NotFoundError, Url } from "@twin.org/core";
import { ComparisonOperator, type EntityCondition } from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { Tenant } from "./entities/tenant.js";
import type { ITenantAdminServiceConstructorOptions } from "./models/ITenantAdminServiceConstructorOptions.js";
import { TenantIdHelper } from "./utils/tenantIdHelper.js";

/**
 * Service for performing tenant administration operations.
 */
export class TenantAdminService implements ITenantAdminComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantAdminService>();

	/**
	 * Entity storage connector used by the service.
	 * @internal
	 */
	private readonly _entityStorageConnector: IEntityStorageConnector<Tenant>;

	/**
	 * Create a new instance of TenantAdminService.
	 * @param options The options for the connector.
	 */
	constructor(options?: ITenantAdminServiceConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return TenantAdminService.CLASS_NAME;
	}

	/**
	 * Get a tenant by its id.
	 * @param tenantId The id of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	public async get(tenantId: string): Promise<ITenant> {
		Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenantId), tenantId, 32);

		let tenant;

		try {
			tenant = await this._entityStorageConnector.get(tenantId);
		} catch {}

		if (!Is.object(tenant)) {
			throw new NotFoundError(TenantAdminService.CLASS_NAME, "tenantNotFound", tenantId);
		}

		return this.entityToModel(tenant);
	}

	/**
	 * Get a tenant by its api key.
	 * @param apiKey The api key of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	public async getByApiKey(apiKey: string): Promise<ITenant> {
		Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(apiKey), apiKey, 32);

		let tenant;

		try {
			tenant = await this._entityStorageConnector.get(apiKey, "apiKey");
		} catch {}

		if (!Is.object(tenant)) {
			throw new NotFoundError(TenantAdminService.CLASS_NAME, "tenantNotFound", apiKey);
		}

		return this.entityToModel(tenant);
	}

	/**
	 * Get a tenant by its public origin.
	 * @param publicOrigin The origin of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	public async getByPublicOrigin(publicOrigin: string): Promise<ITenant> {
		Guards.stringValue(TenantAdminService.CLASS_NAME, nameof(publicOrigin), publicOrigin);

		let tenant;

		try {
			tenant = await this._entityStorageConnector.get(publicOrigin, "publicOrigin");
		} catch {}

		if (!Is.object(tenant)) {
			throw new NotFoundError(TenantAdminService.CLASS_NAME, "tenantNotFound", publicOrigin);
		}

		return this.entityToModel(tenant);
	}

	/**
	 * Get a tenant by its organization id, optionally searching legacy ids.
	 * @param organizationId The organization id of the tenant.
	 * @param includeLegacy Whether to also search the legacy organization id array.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	public async getTenantByOrganizationId(
		organizationId: string,
		includeLegacy?: boolean
	): Promise<ITenant> {
		Guards.stringValue(TenantAdminService.CLASS_NAME, nameof(organizationId), organizationId);

		let tenant: Tenant | undefined;

		try {
			tenant = await this._entityStorageConnector.get(organizationId, "organizationId");
		} catch {}

		if (!Is.object(tenant) && includeLegacy) {
			const result = await this._entityStorageConnector.query(
				{
					property: "organizationIdLegacy",
					comparison: ComparisonOperator.Includes,
					value: `|${organizationId}|`
				},
				undefined,
				undefined,
				undefined,
				1
			);
			tenant = (result.entities as Tenant[])[0];
		}

		if (!Is.object(tenant)) {
			throw new NotFoundError(TenantAdminService.CLASS_NAME, "tenantNotFound", organizationId);
		}

		return this.entityToModel(tenant);
	}

	/**
	 * Create a tenant.
	 * @param tenant The tenant to store.
	 * @returns The tenant id.
	 */
	public async create(
		tenant: Omit<ITenant, "id" | "dateCreated" | "dateModified"> & { id?: string }
	): Promise<string> {
		Guards.objectValue<ITenant>(TenantAdminService.CLASS_NAME, nameof(tenant), tenant);
		Guards.stringValue(
			TenantAdminService.CLASS_NAME,
			nameof(tenant.organizationId),
			tenant.organizationId
		);
		if (Is.stringValue(tenant.id)) {
			Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenant.id), tenant.id, 32);
			const existing = await this._entityStorageConnector.get(tenant.id);
			if (Is.object(existing)) {
				throw new AlreadyExistsError(
					TenantAdminService.CLASS_NAME,
					"tenantAlreadyExists",
					tenant.id
				);
			}
		}
		if (Is.stringValue(tenant.apiKey)) {
			Guards.stringHexLength(
				TenantAdminService.CLASS_NAME,
				nameof(tenant.apiKey),
				tenant.apiKey,
				32
			);
		}

		let publicOrigin: string | undefined;
		if (Is.stringValue(tenant.publicOrigin)) {
			Url.guard(TenantAdminService.CLASS_NAME, nameof(tenant.publicOrigin), tenant.publicOrigin);

			const url = new Url(tenant.publicOrigin);
			const parts = url.parts();
			publicOrigin = `${parts.schema}://${parts.host}${Is.integer(parts.port) ? `:${parts.port}` : ""}`;
		}

		if (Is.stringValue(tenant.apiKey)) {
			const existingApiKey = await this._entityStorageConnector.get(tenant.apiKey, "apiKey");
			if (Is.object(existingApiKey) && existingApiKey.id !== tenant.id) {
				throw new GeneralError(TenantAdminService.CLASS_NAME, "apiKeyAlreadyInUse");
			}
		}

		if (Is.stringValue(publicOrigin)) {
			const existingPublicOrigin = await this._entityStorageConnector.get(
				publicOrigin,
				"publicOrigin"
			);
			if (Is.object(existingPublicOrigin)) {
				throw new AlreadyExistsError(
					TenantAdminService.CLASS_NAME,
					"publicOriginAlreadyExists",
					publicOrigin
				);
			}
		}

		const existingOrgId = await this._entityStorageConnector.get(
			tenant.organizationId,
			"organizationId"
		);
		if (Is.object(existingOrgId)) {
			throw new AlreadyExistsError(
				TenantAdminService.CLASS_NAME,
				"organizationIdAlreadyExists",
				tenant.organizationId
			);
		}

		const tenantEntity: ITenant = {
			id: tenant.id ?? TenantIdHelper.generateTenantId(),
			apiKey: tenant.apiKey ?? TenantIdHelper.generateApiKey(),
			dateCreated: new Date(Date.now()).toISOString(),
			dateModified: new Date(Date.now()).toISOString(),
			label: tenant.label,
			publicOrigin,
			organizationId: tenant.organizationId,
			organizationIdLegacy: tenant.organizationIdLegacy
		};

		await this._entityStorageConnector.set(this.modelToEntity(tenantEntity));

		return tenantEntity.id;
	}

	/**
	 * Update a tenant.
	 * @param tenant The tenant to update.
	 * @returns A promise that resolves when the tenant has been updated.
	 */
	public async update(
		tenant: Partial<Omit<ITenant, "dateCreated" | "dateModified">>
	): Promise<void> {
		Guards.objectValue<ITenant>(TenantAdminService.CLASS_NAME, nameof(tenant), tenant);
		Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenant.id), tenant.id, 32);
		Guards.stringValue(
			TenantAdminService.CLASS_NAME,
			nameof(tenant.organizationId),
			tenant.organizationId
		);
		if (Is.stringValue(tenant.apiKey)) {
			Guards.stringHexLength(
				TenantAdminService.CLASS_NAME,
				nameof(tenant.apiKey),
				tenant.apiKey,
				32
			);
		}

		let publicOrigin: string | undefined;
		if (Is.stringValue(tenant.publicOrigin)) {
			Url.guard(TenantAdminService.CLASS_NAME, nameof(tenant.publicOrigin), tenant.publicOrigin);

			const url = new Url(tenant.publicOrigin);
			const parts = url.parts();
			publicOrigin = `${parts.schema}://${parts.host}${Is.integer(parts.port) ? `:${parts.port}` : ""}`;
		}

		const currentTenant = await this._entityStorageConnector.get(tenant.id);
		if (!Is.object(currentTenant)) {
			throw new NotFoundError(TenantAdminService.CLASS_NAME, "tenantNotFound", tenant.id);
		}

		if (Is.stringValue(tenant.apiKey)) {
			const existingApiKey = await this._entityStorageConnector.get(tenant.apiKey, "apiKey");
			if (Is.object(existingApiKey) && existingApiKey.id !== currentTenant.id) {
				throw new GeneralError(TenantAdminService.CLASS_NAME, "apiKeyAlreadyInUse");
			}
		}

		if (Is.stringValue(publicOrigin)) {
			const existingPublicOrigin = await this._entityStorageConnector.get(
				publicOrigin,
				"publicOrigin"
			);
			if (Is.object(existingPublicOrigin) && existingPublicOrigin.id !== currentTenant.id) {
				throw new AlreadyExistsError(
					TenantAdminService.CLASS_NAME,
					"publicOriginAlreadyExists",
					publicOrigin
				);
			}
		}

		const existingOrgId = await this._entityStorageConnector.get(
			tenant.organizationId,
			"organizationId"
		);
		if (Is.object(existingOrgId) && existingOrgId.id !== currentTenant.id) {
			throw new AlreadyExistsError(
				TenantAdminService.CLASS_NAME,
				"organizationIdAlreadyExists",
				tenant.organizationId
			);
		}

		const currentTenantEntity = this.entityToModel(currentTenant);

		const orgIdChanged = tenant.organizationId !== currentTenantEntity.organizationId;

		let newOrganizationIdLegacy: string[] | undefined;
		if (orgIdChanged) {
			const legacySet = new Set(currentTenantEntity.organizationIdLegacy ?? []);
			if (Is.stringValue(currentTenantEntity.organizationId)) {
				legacySet.add(currentTenantEntity.organizationId);
			}
			legacySet.delete(tenant.organizationId);
			newOrganizationIdLegacy = legacySet.size > 0 ? [...legacySet] : undefined;
		} else {
			newOrganizationIdLegacy = Is.array(tenant.organizationIdLegacy)
				? tenant.organizationIdLegacy
				: currentTenantEntity.organizationIdLegacy;
		}

		const tenantEntity: ITenant = {
			id: tenant.id,
			apiKey: tenant.apiKey ?? currentTenantEntity.apiKey,
			dateCreated: currentTenantEntity.dateCreated,
			dateModified: new Date(Date.now()).toISOString(),
			label: tenant.label ?? currentTenantEntity.label,
			publicOrigin: publicOrigin ?? currentTenantEntity.publicOrigin,
			organizationId: tenant.organizationId,
			organizationIdLegacy: newOrganizationIdLegacy
		};

		await this._entityStorageConnector.set(this.modelToEntity(tenantEntity));
	}

	/**
	 * Remove a tenant by its id.
	 * @param tenantId The id of the tenant.
	 * @returns Nothing.
	 */
	public async remove(tenantId: string): Promise<void> {
		Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenantId), tenantId, 32);

		return this._entityStorageConnector.remove(tenantId);
	}

	/**
	 * Query tenants with pagination.
	 * @param conditions The conditions to filter the tenants.
	 * @param properties The properties to include in the returned tenants.
	 * @param cursor The cursor to start from.
	 * @param limit The maximum number of tenants to return.
	 * @returns The tenants and the next cursor if more tenants are available.
	 */
	public async query(
		conditions?: EntityCondition<ITenant>,
		properties?: (keyof ITenant)[],
		cursor?: string,
		limit?: number
	): Promise<{ tenants: ITenant[]; cursor?: string }> {
		const result = await this._entityStorageConnector.query(
			conditions,
			undefined,
			properties,
			cursor,
			limit
		);

		return {
			tenants: result.entities as ITenant[],
			cursor: result.cursor
		};
	}

	/**
	 * Convert a tenant entity to a tenant model.
	 * @param tenant The tenant entity.
	 * @returns The tenant model.
	 * @internal
	 */
	private entityToModel(tenant: Tenant): ITenant {
		return {
			id: tenant.id,
			apiKey: tenant.apiKey,
			label: tenant.label,
			dateCreated: tenant.dateCreated,
			dateModified: tenant.dateModified,
			publicOrigin: tenant.publicOrigin,
			organizationId: tenant.organizationId,
			organizationIdLegacy: tenant.organizationIdLegacy?.split("|").filter(Boolean)
		};
	}

	/**
	 * Convert a tenant model to a tenant entity.
	 * @param tenant The tenant model.
	 * @returns The tenant entity.
	 * @internal
	 */
	private modelToEntity(tenant: ITenant): Tenant {
		const tenantEntity = new Tenant();
		tenantEntity.id = tenant.id;
		tenantEntity.apiKey = tenant.apiKey;
		tenantEntity.label = tenant.label;
		tenantEntity.dateCreated = tenant.dateCreated;
		tenantEntity.dateModified = tenant.dateModified;
		tenantEntity.publicOrigin = tenant.publicOrigin;
		tenantEntity.organizationId = tenant.organizationId;
		tenantEntity.organizationIdLegacy = Is.arrayValue(tenant.organizationIdLegacy)
			? `|${tenant.organizationIdLegacy.join("|")}|`
			: undefined;
		return tenantEntity;
	}
}
