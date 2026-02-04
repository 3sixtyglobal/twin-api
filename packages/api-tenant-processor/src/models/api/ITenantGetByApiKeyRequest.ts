// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The tenant to get by API key.
 */
export interface ITenantGetByApiKeyRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The API key of the tenant to get.
		 */
		apiKey: string;
	};
}
