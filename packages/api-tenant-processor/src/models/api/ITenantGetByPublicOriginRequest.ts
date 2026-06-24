// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The tenant to get by public origin.
 */
export interface ITenantGetByPublicOriginRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The public origin of the tenant to get.
		 */
		publicOrigin: string;
	};
}
