// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IHttpRequestQuery } from "../protocol/IHttpRequestQuery.js";

/**
 * The URL transformer component for encrypting and decrypting URL parameters.
 */
export interface IUrlTransformerComponent extends IComponent {
	/**
	 * Encrypt a named token value and append it as a query parameter to the given URL.
	 * The URL param name is resolved from the configured token name dictionary using the id.
	 * @param url The URL to append the encrypted token to.
	 * @param id The logical token identifier (e.g. "tenant").
	 * @param value The value to encrypt and add.
	 * @returns The URL with the encrypted token added as a query parameter.
	 */
	addEncryptedQueryParamToUrl(url: string, id: string, value: string): Promise<string>;

	/**
	 * Get a named token value from the query parameters.
	 * The URL param name is resolved from the configured token name dictionary using the id.
	 * @param queryParams The HTTP request query containing the parameters.
	 * @param id The logical token identifier (e.g. "tenant").
	 * @returns The decrypted token value if it exists.
	 */
	getEncryptedQueryParam(
		queryParams: IHttpRequestQuery | undefined,
		id: string
	): Promise<string | undefined>;

	/**
	 * Add encrypted key/value pairs to a URL's query string.
	 * Existing query parameters on the URL are preserved; the provided params are
	 * merged in and then encrypted before being written back to the URL.
	 * @param url The base URL to add parameters to.
	 * @param params The key/value pairs to encrypt and append.
	 * @returns The URL with the encrypted parameters added.
	 */
	addEncryptedToUrl(url: string, params: IHttpRequestQuery): Promise<string>;

	/**
	 * Decrypt specified keys from a query parameter object and return their plain-text values.
	 * @param queryParams The HTTP request query containing the encrypted parameters.
	 * @param keys The keys to decrypt.
	 * @returns A map of the decrypted key/value pairs that were present.
	 */
	getDecryptedFromQueryParams(
		queryParams: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<IHttpRequestQuery>;

	/**
	 * Encrypt query parameters using the URL transformer's encryption mechanism.
	 * @param httpRequestQuery The HTTP request query containing the parameters to encrypt.
	 * @param keys The keys of the parameters to encrypt.
	 * @returns A promise that resolves when the query parameters have been encrypted.
	 */
	encryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void>;

	/**
	 * Decrypt query parameters using the URL transformer's encryption mechanism.
	 * @param httpRequestQuery The HTTP request query containing the encrypted values.
	 * @param keys The keys of the parameters to decrypt.
	 * @returns A promise that resolves when the query parameters have been decrypted.
	 */
	decryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void>;

	/**
	 * Encrypt a parameter value.
	 * @param paramValue The value of the parameter to encrypt.
	 * @returns A promise that resolves to the encrypted value of the parameter.
	 */
	encryptParam(paramValue: string): Promise<string>;

	/**
	 * Decrypt a parameter value.
	 * @param encryptedValue The encrypted value of the parameter.
	 * @returns A promise that resolves to the decrypted value of the parameter.
	 */
	decryptParam(encryptedValue: string): Promise<string>;
}
