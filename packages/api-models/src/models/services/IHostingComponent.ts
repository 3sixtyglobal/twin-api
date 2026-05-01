// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IHttpRequestQuery } from "../protocol/IHttpRequestQuery.js";

/**
 * The information about the hosting of the API.
 */
export interface IHostingComponent extends IComponent {
	/**
	 * Get the public origin for the hosting.
	 * @param serverRequestUrl The url of the current server request if there is one.
	 * @returns The public origin.
	 */
	getPublicOrigin(serverRequestUrl?: string): Promise<string>;

	/**
	 * Get the public origin for the tenant if one exists.
	 * @param tenantId The tenant identifier.
	 * @returns The public origin for the tenant.
	 */
	getTenantOrigin(tenantId: string): Promise<string | undefined>;

	/**
	 * Build a public url based on the public origin and the url provided.
	 * @param url The url to build upon the public origin.
	 * @returns The full url based on the public origin.
	 */
	buildPublicUrl(url: string): Promise<string>;

	/**
	 * Add encrypted key/value pairs to a URL's query string.
	 * Existing query parameters on the URL are preserved; the provided params are
	 * merged in and then encrypted before being written back to the URL.
	 * @param url The base URL to add parameters to.
	 * @param params The key/value pairs to encrypt and append.
	 * @returns The URL with the encrypted parameters added.
	 */
	addEncryptedParamsToUrl(url: string, params: IHttpRequestQuery): Promise<string>;

	/**
	 * Decrypt specified keys from a query parameter object and return their plain-text values.
	 * @param queryParams The HTTP request query containing the encrypted parameters.
	 * @param keys The keys to decrypt.
	 * @returns A map of the decrypted key/value pairs that were present.
	 */
	getDecryptedParamsFromQueryParams(
		queryParams: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<IHttpRequestQuery>;

	/**
	 * Encrypt the tenant id and append it as a query parameter to the given URL.
	 * @param url The URL to append the encrypted tenant token to.
	 * @param tenantId The tenant identifier to encrypt and add.
	 * @returns The URL with the encrypted tenant token added as a query parameter.
	 */
	addTenantTokenToUrl(url: string, tenantId: string): Promise<string>;
	/**
	 * Get the tenant token from the query parameters.
	 * @param queryParams The HTTP request query containing the parameters.
	 * @returns The tenant token if it exists.
	 */
	getTenantTokenFromQueryParams(
		queryParams: IHttpRequestQuery | undefined
	): Promise<string | undefined>;

	/**
	 * Encrypt query parameters using the hosting component's encryption mechanism.
	 * @param httpRequestQuery The HTTP request query containing the parameters to encrypt.
	 * @param keys The keys of the parameters to encrypt.
	 * @returns A promise that resolves when the query parameters have been encrypted.
	 */
	encryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void>;

	/**
	 * Decrypt query parameters using the hosting component's encryption mechanism.
	 * @param httpRequestQuery The HTTP request query containing the encrypted values.
	 * @param keys The keys of the parameters to decrypt.
	 * @returns A promise that resolves when the query parameters have been decrypted.
	 */
	decryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void>;

	/**
	 * Encrypt a parameter value using the hosting component's encryption mechanism.
	 * @param paramValue The value of the parameter to encrypt.
	 * @returns A promise that resolves to the encrypted value of the parameter.
	 */
	encryptParam(paramValue: string): Promise<string>;

	/**
	 * Decrypt a parameter value using the hosting component's encryption mechanism.
	 * @param encryptedValue The encrypted value of the parameter.
	 * @returns A promise that resolves to the decrypted value of the parameter.
	 */
	decryptParam(encryptedValue: string): Promise<string>;
}
