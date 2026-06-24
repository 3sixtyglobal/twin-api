// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The tenant to get by id.
 */
export interface ITenantGetByIdRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The id of the tenant to get.
		 */
		id: string;
	};
}
