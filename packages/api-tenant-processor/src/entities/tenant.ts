// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";

/**
 * Class defining the storage for node tenants.
 */
@entity()
export class Tenant {
	/**
	 * The unique identifier for the tenant.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The api key for the tenant.
	 */
	@property({ type: "string" })
	public apiKey!: string;

	/**
	 * The label of the tenant.
	 */
	@property({ type: "string" })
	public label!: string;

	/**
	 * The date the tenant was created.
	 */
	@property({ type: "string" })
	public dateCreated!: string;

	/**
	 * The origin available to the public for accessing the API.
	 */
	@property({ type: "string", optional: true })
	public publicOrigin?: string;

	/**
	 * Indicates whether the tenant is the node tenant.
	 */
	@property({ type: "boolean" })
	public isNodeTenant!: boolean;
}
