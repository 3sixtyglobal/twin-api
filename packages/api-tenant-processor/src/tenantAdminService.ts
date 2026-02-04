// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantAdminComponent, ITenant } from "@twin.org/api-models";
import { GeneralError, Guards, Is, Url, NotFoundError } from "@twin.org/core";
import { ComparisonOperator } from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { Tenant } from "./entities/tenant.js";
import type { ITenantAdminServiceConstructorOptions } from "./models/ITenantAdminServiceConstructorOptions.js";
import { TenantIdHelper } from "./utils/tenantIdHelper.js";

/**
 * Service for performing email messaging operations to a connector.
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

		return tenant;
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

		return tenant;
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

		return tenant;
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
		if (Is.stringValue(tenant.id)) {
			Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenant.id), tenant.id, 32);
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

		const tenantEntity = new Tenant();
		tenantEntity.id = tenant.id ?? TenantIdHelper.generateTenantId();
		tenantEntity.apiKey = tenant.apiKey ?? TenantIdHelper.generateApiKey();
		tenantEntity.dateCreated = new Date(Date.now()).toISOString();
		tenantEntity.dateModified = tenantEntity.dateCreated;
		tenantEntity.label = tenant.label;
		tenantEntity.publicOrigin = publicOrigin;
		tenantEntity.isNodeTenant = tenant.isNodeTenant;

		await this._entityStorageConnector.set(tenantEntity);

		return tenantEntity.id;
	}

	/**
	 * Update a tenant.
	 * @param tenant The tenant to update.
	 * @returns The nothing.
	 */
	public async update(
		tenant: Partial<Omit<ITenant, "dateCreated" | "dateModified">>
	): Promise<void> {
		Guards.objectValue<ITenant>(TenantAdminService.CLASS_NAME, nameof(tenant), tenant);
		Guards.stringHexLength(TenantAdminService.CLASS_NAME, nameof(tenant.id), tenant.id, 32);
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

		const tenantEntity = new Tenant();
		tenantEntity.id = tenant.id;
		tenantEntity.apiKey = tenant.apiKey ?? currentTenant.apiKey;
		tenantEntity.dateCreated = currentTenant.dateCreated;
		tenantEntity.dateModified = new Date(Date.now()).toISOString();
		tenantEntity.label = tenant.label ?? currentTenant.label;
		tenantEntity.publicOrigin = publicOrigin ?? currentTenant.publicOrigin;
		tenantEntity.isNodeTenant = tenant.isNodeTenant ?? currentTenant.isNodeTenant;

		await this._entityStorageConnector.set(tenantEntity);
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
	 * @param options Optional query options.
	 * @param options.isNodeTenant Whether to filter for node admin tenants.
	 * @param cursor The cursor to start from.
	 * @param limit The maximum number of tenants to return.
	 * @returns The tenants and the next cursor if more tenants are available.
	 */
	public async query(
		options?: { isNodeTenant?: boolean },
		cursor?: string,
		limit?: number
	): Promise<{ tenants: ITenant[]; cursor?: string }> {
		const conditions = [];

		if (Is.boolean(options?.isNodeTenant)) {
			conditions.push({
				property: "isNodeTenant",
				value: options.isNodeTenant,
				comparison: ComparisonOperator.Equals
			});
		}

		const result = await this._entityStorageConnector.query(
			conditions.length > 0 ? { conditions } : undefined,
			undefined,
			undefined,
			cursor,
			limit
		);

		return {
			tenants: result.entities as ITenant[],
			cursor: result.cursor
		};
	}
}
