// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { ITenant } from "./ITenant.js";

/**
 * Configuration for the tenant admin component
 */
export interface ITenantAdminComponent extends IComponent {
	/**
	 * Create a tenant.
	 * @param tenant The tenant to store.
	 * @returns The tenant id.
	 */
	create(
		tenant: Omit<ITenant, "id" | "dateCreated" | "dateModified"> & { id?: string }
	): Promise<string>;

	/**
	 * Update a tenant.
	 * @param tenant The tenant to update.
	 * @returns Nothing.
	 */
	update(tenant: Partial<Omit<ITenant, "dateCreated" | "dateModified">>): Promise<void>;

	/**
	 * Get a tenant by its id.
	 * @param tenantId The id of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	get(tenantId: string): Promise<ITenant>;

	/**
	 * Get a tenant by its api key.
	 * @param apiKey The api key of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	getByApiKey(apiKey: string): Promise<ITenant>;

	/**
	 * Get a tenant by its public origin.
	 * @param publicOrigin The origin of the tenant.
	 * @returns The tenant.
	 * @throws Error if the tenant is not found.
	 */
	getByPublicOrigin(publicOrigin: string): Promise<ITenant>;

	/**
	 * Remove a tenant by its id.
	 * @param tenantId The id of the tenant.
	 * @returns Nothing.
	 * @throws Error if the tenant is not found.
	 */
	remove(tenantId: string): Promise<void>;

	/**
	 * Query tenants with pagination.
	 * @param properties The properties to include in the returned tenants.
	 * @param cursor The cursor to start from.
	 * @param limit The maximum number of tenants to return.
	 * @returns The tenants and the next cursor if more tenants are available.
	 */
	query(
		properties: (keyof ITenant)[] | undefined,
		cursor?: string,
		limit?: number
	): Promise<{ tenants: ITenant[]; cursor?: string }>;
}
