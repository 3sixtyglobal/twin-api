// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the URL transformer service.
 */
export interface IUrlTransformerServiceConfig {
	/**
	 * The name of the key to retrieve from the vault for encryption/decryption of parameters.
	 * @default param-encryption
	 */
	paramEncryptionKeyName?: string;

	/**
	 * A dictionary mapping logical token identifiers to their URL query parameter names.
	 * For example: tenant => tenant-token maps the logical id "tenant" to the
	 * query param "tenant-token". When an id is not present the id itself is used as
	 * the param name.
	 */
	queryParamNames?: { [id: string]: string };
}
