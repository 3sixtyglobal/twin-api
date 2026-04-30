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
	 * The name of the symmetric key in the vault used to encrypt/decrypt tenant tokens.
	 * @default tenant-token-encryption
	 */
	signingKeyName?: string;

	/**
	 * The query param name to look for the encrypted tenant token.
	 * @default tenantToken
	 */
	tenantTokenName?: string;
}
