// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the hosting service.
 */
export interface IHostingServiceConfig {
	/**
	 * The local origin, must be provided as a fallback e.g. http://localhost:1234.
	 */
	localOrigin: string;

	/**
	 * The APIs public base URL e.g. "https://api.example.com:1234".
	 */
	publicOrigin?: string;

	/**
	 * The name of the key to retrieve from the vault for encryption/decryption of parameters.
	 * @default param-encryption
	 */
	paramEncryptionKeyName?: string;

	/**
	 * The query param name to look for the encrypted tenant token.
	 * @default tenant-token
	 */
	tenantTokenName?: string;
}
