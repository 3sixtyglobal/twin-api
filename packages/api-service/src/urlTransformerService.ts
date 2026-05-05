// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRequestQuery, IUrlTransformerComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	BaseError,
	Converter,
	GeneralError,
	Guards,
	Is,
	ObjectHelper,
	RandomHelper,
	Uint8ArrayHelper
} from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import {
	type IVaultConnector,
	VaultConnectorFactory,
	VaultEncryptionType
} from "@twin.org/vault-models";
import type { IUrlTransformerServiceConstructorOptions } from "./models/IUrlTransformerServiceConstructorOptions.js";

/**
 * The URL transformer service for encrypting and decrypting URL parameters.
 */
export class UrlTransformerService implements IUrlTransformerComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<UrlTransformerService>();

	/**
	 * The prefix to use for encrypted query parameters.
	 * @internal
	 */
	private static readonly _KEY_PREFIX = "x-enc-";

	/**
	 * The default name for the parameter encryption key query parameter.
	 * @internal
	 */
	private static readonly _DEFAULT_PARAM_ENCRYPTION_KEY_NAME: string = "param-encryption";

	/**
	 * The vault connector.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The name of the key to retrieve from the vault for encryption/decryption of parameters.
	 * @internal
	 */
	private readonly _paramEncryptionKeyName: string;

	/**
	 * Maps logical token ids to their URL query parameter names.
	 * @internal
	 */
	private readonly _queryParamNames: { [id: string]: string };

	/**
	 * The node identity, captured at start.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of UrlTransformerService.
	 * @param options The options to create the service.
	 */
	constructor(options?: IUrlTransformerServiceConstructorOptions) {
		this._vaultConnector = VaultConnectorFactory.get(options?.vaultConnectorType ?? "vault");
		this._paramEncryptionKeyName =
			options?.config?.paramEncryptionKeyName ??
			UrlTransformerService._DEFAULT_PARAM_ENCRYPTION_KEY_NAME;
		this._queryParamNames = options?.config?.queryParamNames ?? {};
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return UrlTransformerService.CLASS_NAME;
	}

	/**
	 * The component needs to be started when the node is initialized.
	 * @returns Nothing.
	 */
	public async start(): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		this._nodeId = contextIds?.[ContextIdKeys.Node];
	}

	/**
	 * Encrypt a named token value and append it as a query parameter to the given URL.
	 * @param url The URL to append the encrypted token to.
	 * @param id The logical token identifier (e.g. "tenant").
	 * @param value The value to encrypt and add.
	 * @returns The URL with the encrypted token added as a query parameter.
	 */
	public async addEncryptedQueryParamToUrl(
		url: string,
		id: string,
		value: string
	): Promise<string> {
		const paramName = this._queryParamNames[id] ?? id;
		return this.addEncryptedParamsToUrl(url, { [paramName]: value });
	}

	/**
	 * Get a named token value from the query parameters.
	 * @param queryParams The HTTP request query containing the parameters.
	 * @param id The logical token identifier (e.g. "tenant").
	 * @returns The decrypted token value if it exists.
	 */
	public async getEncryptedQueryParam(
		queryParams: IHttpRequestQuery | undefined,
		id: string
	): Promise<string | undefined> {
		const paramName = this._queryParamNames[id] ?? id;
		const decrypted = await this.getDecryptedParamsFromQueryParams(queryParams, [paramName]);
		return decrypted[paramName];
	}

	/**
	 * Add encrypted key/value pairs to a URL's query string.
	 * @param url The base URL to add parameters to.
	 * @param params The key/value pairs to encrypt and append.
	 * @returns The URL with the encrypted parameters added.
	 */
	public async addEncryptedParamsToUrl(url: string, params: IHttpRequestQuery): Promise<string> {
		const urlObj = new URL(url);
		const query: IHttpRequestQuery = {};
		for (const [key, value] of urlObj.searchParams.entries()) {
			query[key] = value;
		}
		const keysToEncrypt = Object.keys(params);
		for (const [key, value] of Object.entries(params)) {
			query[key] = value;
		}
		await this.encryptQueryParams(query, keysToEncrypt);
		urlObj.search = "";
		for (const [key, value] of Object.entries(query)) {
			urlObj.searchParams.set(key, value);
		}
		return urlObj.toString();
	}

	/**
	 * Decrypt specified keys from a query parameter object and return their plain-text values.
	 * @param queryParams The HTTP request query containing the encrypted parameters.
	 * @param keys The keys to decrypt.
	 * @returns A map of the decrypted key/value pairs that were present.
	 */
	public async getDecryptedParamsFromQueryParams(
		queryParams: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<IHttpRequestQuery> {
		const queryParamsClone = ObjectHelper.clone(queryParams) ?? {};
		await this.decryptQueryParams(queryParamsClone, keys);
		const result: IHttpRequestQuery = {};
		for (const key of keys) {
			if (Is.stringValue(queryParamsClone[key])) {
				result[key] = queryParamsClone[key];
			}
		}
		return result;
	}

	/**
	 * Encrypt query parameters.
	 * @param httpRequestQuery The HTTP request query containing the parameters to encrypt.
	 * @param keys The keys of the parameters to encrypt.
	 * @returns A promise that resolves when the query parameters have been encrypted.
	 */
	public async encryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void> {
		if (Is.empty(httpRequestQuery)) {
			return;
		}

		for (const key of keys) {
			if (Is.stringValue(httpRequestQuery[key])) {
				const encryptedValue = await this.encryptParam(httpRequestQuery[key]);
				httpRequestQuery[`${UrlTransformerService._KEY_PREFIX}${key}`] = encryptedValue;
				delete httpRequestQuery[key];
			}
		}
	}

	/**
	 * Decrypt query parameters.
	 * @param httpRequestQuery The HTTP request query containing the encrypted values.
	 * @param keys The keys of the parameters to decrypt.
	 * @returns A promise that resolves when the query parameters have been decrypted.
	 */
	public async decryptQueryParams(
		httpRequestQuery: IHttpRequestQuery | undefined,
		keys: string[]
	): Promise<void> {
		if (Is.empty(httpRequestQuery)) {
			return;
		}
		for (const key of Object.keys(httpRequestQuery)) {
			if (key.startsWith(UrlTransformerService._KEY_PREFIX)) {
				const originalKey = key.slice(UrlTransformerService._KEY_PREFIX.length);

				if (keys.includes(originalKey)) {
					const decryptedValue = await this.decryptParam(httpRequestQuery[key]);
					httpRequestQuery[originalKey] = decryptedValue;
					delete httpRequestQuery[key];
				}
			}
		}
	}

	/**
	 * Encrypt a parameter value.
	 * @param paramValue The value of the parameter to encrypt.
	 * @returns A promise that resolves to the encrypted value of the parameter.
	 */
	public async encryptParam(paramValue: string): Promise<string> {
		Guards.stringValue(UrlTransformerService.CLASS_NAME, nameof(paramValue), paramValue);

		if (Is.empty(this._nodeId)) {
			throw new GeneralError(UrlTransformerService.CLASS_NAME, "encryptionUnavailable");
		}

		try {
			const salt = RandomHelper.generate(8);

			const encryptedParamValue = await this._vaultConnector.encrypt(
				`${this._nodeId}/${this._paramEncryptionKeyName}`,
				VaultEncryptionType.ChaCha20Poly1305,
				Uint8ArrayHelper.concat([salt, Converter.utf8ToBytes(paramValue)])
			);

			if (!Is.uint8Array(encryptedParamValue)) {
				throw new GeneralError(UrlTransformerService.CLASS_NAME, "encryptionFailed");
			}

			return Converter.bytesToBase64Url(encryptedParamValue);
		} catch (err) {
			throw new GeneralError(
				UrlTransformerService.CLASS_NAME,
				"encryptionFailed",
				undefined,
				BaseError.fromError(err)
			);
		}
	}

	/**
	 * Decrypt a parameter value.
	 * @param encryptedValue The encrypted value of the parameter.
	 * @returns A promise that resolves to the decrypted value of the parameter.
	 */
	public async decryptParam(encryptedValue: string): Promise<string> {
		Guards.stringValue(UrlTransformerService.CLASS_NAME, nameof(encryptedValue), encryptedValue);

		if (Is.empty(this._nodeId)) {
			throw new GeneralError(UrlTransformerService.CLASS_NAME, "decryptionUnavailable");
		}

		try {
			const encryptedBytes = Converter.base64UrlToBytes(encryptedValue);
			const decryptedBytes = await this._vaultConnector.decrypt(
				`${this._nodeId}/${this._paramEncryptionKeyName}`,
				VaultEncryptionType.ChaCha20Poly1305,
				encryptedBytes
			);

			if (!Is.uint8Array(decryptedBytes)) {
				throw new GeneralError(UrlTransformerService.CLASS_NAME, "decryptionFailed");
			}

			return Converter.bytesToUtf8(decryptedBytes.slice(8));
		} catch (err) {
			throw new GeneralError(
				UrlTransformerService.CLASS_NAME,
				"decryptionFailed",
				undefined,
				BaseError.fromError(err)
			);
		}
	}
}
