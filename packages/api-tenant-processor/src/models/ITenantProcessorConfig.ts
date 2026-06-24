// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the tenant processor
 */
export interface ITenantProcessorConfig {
	/**
	 * The key to look for in the header or query params for the api key.
	 * @default x-api-key
	 */
	apiKeyName?: string;

	/**
	 * The list of endpoint paths that should be checked for an api key header, can be regexp strings. Defaults to ["/login$"].
	 */
	apiKeyEndpoints?: string[];
}
