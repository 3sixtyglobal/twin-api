// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The tenant to remove by id.
 */
export interface ITenantRemoveRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The id of the tenant to remove.
		 */
		id: string;
	};
}
