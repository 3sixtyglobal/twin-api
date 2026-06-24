// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Model defining the tenant.
 */
export interface ITenant {
	/**
	 * The unique identifier for the tenant.
	 */
	id: string;

	/**
	 * The api key for the tenant.
	 */
	apiKey: string;

	/**
	 * The label of the tenant.
	 */
	label: string;

	/**
	 * The date the tenant was created.
	 */
	dateCreated: string;

	/**
	 * The date the tenant was modified.
	 */
	dateModified: string;

	/**
	 * The public origin available to the public for accessing the API.
	 */
	publicOrigin?: string;

	/**
	 * The organization id for the tenant.
	 */
	organizationId: string;

	/**
	 * Optional list of organization aliases that can are used for legacy lookups.
	 */
	organizationIdLegacy?: string[];
}
