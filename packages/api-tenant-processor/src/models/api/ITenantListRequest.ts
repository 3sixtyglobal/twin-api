// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The list of tenants.
 */
export interface ITenantListRequest {
	/**
	 * The query parameters.
	 */
	query: {
		/**
		 * The cursor to get the next chunk of tenants.
		 */
		cursor?: string;

		/**
		 * The number of tenants to return.
		 */
		limit?: string;
	};
}
