// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, GeneralError, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { type IVaultConnector, VaultEncryptionType } from "@twin.org/vault-models";

/**
 * Helper for building and parsing URLs that carry an encrypted tenant token query param.
 * The token is the ChaCha20Poly1305-encrypted UTF-8 bytes of a tenant id, base64url-encoded
 * for URL safety.
 */
export class TenantUrlHelper {
	/**
	 * The default query param name for the encrypted tenant token.
	 */
	public static readonly DEFAULT_TENANT_TOKEN_NAME: string = "tenantToken";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantUrlHelper>();

	/**
	 * Encrypt a tenant id and append it as an opaque query param to the supplied URL.
	 * @param url The URL to append the token to.
	 * @param tenantId The tenant id to encrypt into the token.
	 * @param vaultConnector The vault connector providing the symmetric key.
	 * @param keyName The fully-qualified vault key name (e.g. `${nodeId}/tenant-token-encryption`).
	 * @param tenantTokenName The query param name. Defaults to `tenantToken`.
	 * @returns The URL with the encrypted tenant token appended.
	 */
	public static async encrypt(
		url: string,
		tenantId: string,
		vaultConnector: IVaultConnector,
		keyName: string,
		tenantTokenName?: string
	): Promise<string> {
		Guards.stringValue(TenantUrlHelper.CLASS_NAME, nameof(url), url);
		Guards.stringValue(TenantUrlHelper.CLASS_NAME, nameof(tenantId), tenantId);
		Guards.object<IVaultConnector>(
			TenantUrlHelper.CLASS_NAME,
			nameof(vaultConnector),
			vaultConnector
		);
		Guards.stringValue(TenantUrlHelper.CLASS_NAME, nameof(keyName), keyName);

		try {
			const encrypted = await vaultConnector.encrypt(
				keyName,
				VaultEncryptionType.ChaCha20Poly1305,
				Converter.utf8ToBytes(tenantId)
			);
			const token = Converter.bytesToBase64Url(encrypted);
			const paramName = tenantTokenName ?? TenantUrlHelper.DEFAULT_TENANT_TOKEN_NAME;
			const separator = url.includes("?") ? "&" : "?";
			return `${url}${separator}${paramName}=${token}`;
		} catch (err) {
			throw new GeneralError(TenantUrlHelper.CLASS_NAME, "encryptFailed", undefined, err);
		}
	}

	/**
	 * Decrypt an encrypted tenant token back into the original tenant id.
	 * @param token The base64url-encoded encrypted tenant token.
	 * @param vaultConnector The vault connector providing the symmetric key.
	 * @param keyName The fully-qualified vault key name used to encrypt the token.
	 * @returns The decrypted tenant id.
	 */
	public static async decrypt(
		token: string,
		vaultConnector: IVaultConnector,
		keyName: string
	): Promise<string> {
		Guards.stringValue(TenantUrlHelper.CLASS_NAME, nameof(token), token);
		Guards.object<IVaultConnector>(
			TenantUrlHelper.CLASS_NAME,
			nameof(vaultConnector),
			vaultConnector
		);
		Guards.stringValue(TenantUrlHelper.CLASS_NAME, nameof(keyName), keyName);

		try {
			const encrypted = Converter.base64UrlToBytes(token);
			const decrypted = await vaultConnector.decrypt(
				keyName,
				VaultEncryptionType.ChaCha20Poly1305,
				encrypted
			);
			return Converter.bytesToUtf8(decrypted);
		} catch (err) {
			throw new GeneralError(TenantUrlHelper.CLASS_NAME, "decryptFailed", undefined, err);
		}
	}
}
