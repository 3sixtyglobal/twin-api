// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpUrlHelper,
	type IHostingComponent,
	type IHttpRequestQuery,
	type ITenantAdminComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	BaseError,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	ObjectHelper,
	RandomHelper,
	Uint8ArrayHelper
} from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, VaultEncryptionType } from "@twin.org/vault-models";
import type { IHostingServiceConstructorOptions } from "./models/IHostingServiceConstructorOptions.js";

/**
 * The hosting service for the server.
 */
export class HostingService implements IHostingComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HostingService>();

	/**
	 * The prefix to use for encrypted query parameters when encrypting/decrypting.
	 * This is used to identify which query parameters have been encrypted.
	 * The actual key used in the query will be "x-enc-{originalKey}".
	 * @internal
	 */
	private static readonly _KEY_PREFIX = "x-enc-";

	/**
	 * The default name for the tenant token query parameter.
	 * @internal
	 */
	private static readonly _DEFAULT_TENANT_TOKEN_NAME: string = "tenant-token";

	/**
	 * The default name for the parameter encryption key query parameter.
	 * @internal
	 */
	private static readonly _DEFAULT_PARAM_ENCRYPTION_KEY_NAME: string = "param-encryption";

	/**
	 * The tenant admin component.
	 * @internal
	 */
	private readonly _tenantAdminComponentType?: string;

	/**
	 * The vault connector type.
	 * @internal
	 */
	private readonly _vaultConnectorType?: string;

	/**
	 * The local origin URL e.g. "http://localhost:3000".
	 * @internal
	 */
	private readonly _localOrigin: string;

	/**
	 * The APIs public base URL e.g. "https://api.example.com:1234".
	 * @internal
	 */
	private readonly _publicOrigin?: string;

	/**
	 * The name of the key to retrieve from the vault for encryption/decryption of parameters.
	 * @internal
	 */
	private readonly _paramEncryptionKeyName: string;

	/**
	 * The query param name carrying the encrypted tenant token.
	 * @internal
	 */
	private readonly _tenantTokenName: string;

	/**
	 * The node identity, captured at start.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of HostingService.
	 * @param options The options to create the service.
	 */
	constructor(options: IHostingServiceConstructorOptions) {
		Guards.object(HostingService.CLASS_NAME, nameof(options), options);
		Guards.object(HostingService.CLASS_NAME, nameof(options.config), options.config);
		Guards.stringValue(
			HostingService.CLASS_NAME,
			nameof(options.config.localOrigin),
			options.config.localOrigin
		);
		this._tenantAdminComponentType = options?.tenantAdminComponentType ?? "tenant-admin";
		this._vaultConnectorType = options?.vaultConnectorType ?? "vault";
		this._localOrigin = options.config.localOrigin;
		this._publicOrigin = options.config.publicOrigin;
		this._paramEncryptionKeyName =
			options.config.paramEncryptionKeyName ?? HostingService._DEFAULT_PARAM_ENCRYPTION_KEY_NAME;
		this._tenantTokenName =
			options.config.tenantTokenName ?? HostingService._DEFAULT_TENANT_TOKEN_NAME;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return HostingService.CLASS_NAME;
	}

	/**
	 * The component needs to be started when the node is initialized.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		this._nodeId = contextIds?.[ContextIdKeys.Node];
	}

	/**
	 * Get the public origin for the hosting.
	 * @param serverRequestUrl The url of the current server request if there is one.
	 * @returns The public origin.
	 */
	public async getPublicOrigin(serverRequestUrl?: string): Promise<string> {
		// If there is a tenant admin component, and the context has a tenant id set.
		// set if the tenant has a specific public origin.
		const contextIds = await ContextIdStore.getContextIds();
		const tenantId = contextIds?.[ContextIdKeys.Tenant];
		let tenantPublicOrigin;
		if (Is.stringValue(tenantId)) {
			tenantPublicOrigin = await this.getTenantOrigin(tenantId);
		}

		const serverRequestOrigin = Is.stringValue(serverRequestUrl)
			? HttpUrlHelper.extractOrigin(serverRequestUrl)
			: undefined;

		// If there is a tenant public origin, return it.
		// If not and the config has a public origin, return it.
		// Otherwise, use the server request URL if provided
		// else fallback to local origin.
		return tenantPublicOrigin ?? this._publicOrigin ?? serverRequestOrigin ?? this._localOrigin;
	}

	/**
	 * Get the public origin for the tenant if one exists.
	 * @param tenantId The tenant identifier.
	 * @returns The public origin for the tenant.
	 */
	public async getTenantOrigin(tenantId: string): Promise<string | undefined> {
		Guards.stringHexLength(HostingService.CLASS_NAME, nameof(tenantId), tenantId, 32);

		const tenantAdminComponent = ComponentFactory.getIfExists<ITenantAdminComponent>(
			this._tenantAdminComponentType
		);

		if (Is.empty(tenantAdminComponent)) {
			return undefined;
		}

		const tenant = await tenantAdminComponent.get(tenantId);
		return tenant?.publicOrigin;
	}

	/**
	 * Build a public url based on the public origin and the url provided.
	 * @param url The url to build upon the public origin.
	 * @returns The full url based on the public origin.
	 */
	public async buildPublicUrl(url: string): Promise<string> {
		const publicOrigin = await this.getPublicOrigin(url);
		return HttpUrlHelper.replaceOrigin(url, publicOrigin);
	}

	/**
	 * Add encrypted key/value pairs to a URL's query string.
	 * Existing query parameters on the URL are preserved; the provided params are
	 * merged in and then encrypted before being written back to the URL.
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
	 * Encrypt the tenant id and append it as a query parameter to the given URL.
	 * @param url The URL to append the encrypted tenant token to.
	 * @param tenantId The tenant identifier to encrypt and add.
	 * @returns The URL with the encrypted tenant token added as a query parameter.
	 */
	public async addTenantTokenToUrl(url: string, tenantId: string): Promise<string> {
		return this.addEncryptedParamsToUrl(url, { [this._tenantTokenName]: tenantId });
	}

	/**
	 * Get the tenant token from the query parameters.
	 * @param queryParams The HTTP request query containing the parameters.
	 * @returns The tenant token if it exists.
	 */
	public async getTenantTokenFromQueryParams(
		queryParams: IHttpRequestQuery | undefined
	): Promise<string | undefined> {
		const decrypted = await this.getDecryptedParamsFromQueryParams(queryParams, [
			this._tenantTokenName
		]);
		return decrypted[this._tenantTokenName];
	}

	/**
	 * Encrypt query parameters using the hosting component's encryption mechanism.
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
				httpRequestQuery[`${HostingService._KEY_PREFIX}${key}`] = encryptedValue;
				delete httpRequestQuery[key];
			}
		}
	}

	/**
	 * Decrypt query parameters using the hosting component's encryption mechanism.
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
			if (key.startsWith(HostingService._KEY_PREFIX)) {
				const originalKey = key.slice(HostingService._KEY_PREFIX.length);

				if (keys.includes(originalKey)) {
					const decryptedValue = await this.decryptParam(httpRequestQuery[key]);
					httpRequestQuery[originalKey] = decryptedValue;
					delete httpRequestQuery[key];
				}
			}
		}
	}

	/**
	 * Encrypt a parameter value using the hosting component's encryption mechanism.
	 * @param paramValue The value of the parameter to encrypt.
	 * @returns A promise that resolves to the encrypted value of the parameter.
	 */
	public async encryptParam(paramValue: string): Promise<string> {
		Guards.stringValue(HostingService.CLASS_NAME, nameof(paramValue), paramValue);

		const vaultConnector = VaultConnectorFactory.getIfExists(this._vaultConnectorType);
		if (Is.empty(vaultConnector) || Is.empty(this._nodeId)) {
			throw new GeneralError(HostingService.CLASS_NAME, "encryptionUnavailable");
		}

		try {
			// Add a salt to the encryption to ensure that the same value encrypted multiple times will yield different results,
			// preventing rainbow table attacks.
			const salt = RandomHelper.generate(8);

			const encryptedParamValue = await vaultConnector.encrypt(
				`${this._nodeId}/${this._paramEncryptionKeyName}`,
				VaultEncryptionType.ChaCha20Poly1305,
				Uint8ArrayHelper.concat([salt, Converter.utf8ToBytes(paramValue)])
			);

			if (!Is.uint8Array(encryptedParamValue)) {
				throw new GeneralError(HostingService.CLASS_NAME, "encryptionFailed");
			}

			return Converter.bytesToBase64Url(encryptedParamValue);
		} catch (err) {
			throw new GeneralError(
				HostingService.CLASS_NAME,
				"encryptionFailed",
				undefined,
				BaseError.fromError(err)
			);
		}
	}

	/**
	 * Decrypt a parameter value using the hosting component's encryption mechanism.
	 * @param encryptedValue The encrypted value of the parameter.
	 * @returns A promise that resolves to the decrypted value of the parameter.
	 */
	public async decryptParam(encryptedValue: string): Promise<string> {
		Guards.stringValue(HostingService.CLASS_NAME, nameof(encryptedValue), encryptedValue);

		const vaultConnector = VaultConnectorFactory.getIfExists(this._vaultConnectorType);
		if (Is.empty(vaultConnector) || Is.empty(this._nodeId)) {
			throw new GeneralError(HostingService.CLASS_NAME, "decryptionUnavailable");
		}

		try {
			const encryptedBytes = Converter.base64UrlToBytes(encryptedValue);
			const decryptedBytes = await vaultConnector.decrypt(
				`${this._nodeId}/${this._paramEncryptionKeyName}`,
				VaultEncryptionType.ChaCha20Poly1305,
				encryptedBytes
			);

			if (!Is.uint8Array(decryptedBytes)) {
				throw new GeneralError(HostingService.CLASS_NAME, "decryptionFailed");
			}

			// The decrypted value is expected to have the salt as the first 8 bytes, which we need to remove before returning the original value.
			return Converter.bytesToUtf8(decryptedBytes.slice(8));
		} catch (err) {
			throw new GeneralError(
				HostingService.CLASS_NAME,
				"decryptionFailed",
				undefined,
				BaseError.fromError(err)
			);
		}
	}
}
