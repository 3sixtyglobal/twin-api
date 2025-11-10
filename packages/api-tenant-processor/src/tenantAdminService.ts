// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { Tenant } from "./entities/tenant.js";
import type { ITenant } from "./models/ITenant.js";
import type { ITenantAdminComponent } from "./models/ITenantAdminComponent.js";
import type { ITenantAdminServiceConstructorOptions } from "./models/ITenantAdminServiceConstructorOptions.js";

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
	 * @returns The tenant or undefined if not found.
	 */
	public async get(tenantId: string): Promise<ITenant | undefined> {
		Guards.stringValue(TenantAdminService.CLASS_NAME, nameof(tenantId), tenantId);

		let tenant;

		try {
			tenant = await this._entityStorageConnector.get(tenantId);
		} catch {}

		return tenant;
	}

	/**
	 * Get a tenant by its api key.
	 * @param apiKey The api key of the tenant.
	 * @returns The tenant or undefined if not found.
	 */
	public async getByApiKey(apiKey: string): Promise<ITenant | undefined> {
		Guards.stringValue(TenantAdminService.CLASS_NAME, nameof(apiKey), apiKey);

		let tenant;

		try {
			tenant = await this._entityStorageConnector.get(apiKey, "apiKey");
		} catch {}

		return tenant;
	}

	/**
	 * Set a tenant.
	 * @param tenant The tenant to store.
	 * @returns Nothing.
	 */
	public async set(tenant: ITenant): Promise<void> {
		Guards.objectValue<ITenant>(TenantAdminService.CLASS_NAME, nameof(tenant), tenant);

		const tenantEntity = new Tenant();
		tenantEntity.id = tenant.id;
		tenantEntity.apiKey = tenant.apiKey;
		tenantEntity.dateCreated = new Date(Date.now()).toISOString();
		tenantEntity.label = tenant.label;

		await this._entityStorageConnector.set(tenantEntity);
	}

	/**
	 * Remove a tenant by its id.
	 * @param tenantId The id of the tenant.
	 * @returns Nothing.
	 */
	public async remove(tenantId: string): Promise<void> {
		Guards.stringValue(TenantAdminService.CLASS_NAME, nameof(tenantId), tenantId);

		return this._entityStorageConnector.remove(tenantId);
	}

	/**
	 * Query tenants with pagination.
	 * @param cursor The cursor to start from.
	 * @param limit The maximum number of tenants to return.
	 * @returns The tenants and the next cursor if more tenants are available.
	 */
	public async query(
		cursor?: string,
		limit?: number
	): Promise<{ tenants: ITenant[]; cursor?: string }> {
		const result = await this._entityStorageConnector.query(
			undefined,
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
