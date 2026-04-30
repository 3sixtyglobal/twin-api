// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, GeneralError } from "@twin.org/core";
import { type IVaultConnector, VaultEncryptionType } from "@twin.org/vault-models";
import { TenantUrlHelper } from "../../src/utils/tenantUrlHelper.js";

describe("TenantUrlHelper", () => {
	let mockVaultConnector: IVaultConnector;
	const KEY_NAME = "node-1/tenant-token-encryption";

	beforeEach(() => {
		vi.restoreAllMocks();

		mockVaultConnector = {
			encrypt: vi.fn(async (_name, _type, data: Uint8Array) => {
				const out = new Uint8Array(data.length + 1);
				out[0] = 0x42;
				out.set(data, 1);
				return out;
			}),
			decrypt: vi.fn(async (_name, _type, data: Uint8Array) => {
				if (data[0] !== 0x42) {
					throw new Error("bad ciphertext");
				}
				return data.slice(1);
			})
		} as unknown as IVaultConnector;
	});

	it("should round-trip a tenant id through encrypt/decrypt", async () => {
		const tenantId = "0199ab00ee5a7b34a0d1e25e9c8b1f01";

		const url = await TenantUrlHelper.encrypt(
			"https://example.com/callback",
			tenantId,
			mockVaultConnector,
			KEY_NAME
		);

		expect(url).toMatch(/^https:\/\/example\.com\/callback\?tenantToken=[\w-]+$/);
		expect(mockVaultConnector.encrypt).toHaveBeenCalledWith(
			KEY_NAME,
			VaultEncryptionType.ChaCha20Poly1305,
			Converter.utf8ToBytes(tenantId)
		);

		const token = url.split("tenantToken=")[1];
		const decrypted = await TenantUrlHelper.decrypt(token, mockVaultConnector, KEY_NAME);

		expect(decrypted).toBe(tenantId);
		expect(mockVaultConnector.decrypt).toHaveBeenCalledWith(
			KEY_NAME,
			VaultEncryptionType.ChaCha20Poly1305,
			expect.any(Uint8Array)
		);
	});

	it("should append with & when the URL already has a query string", async () => {
		const url = await TenantUrlHelper.encrypt(
			"https://example.com/callback?foo=bar",
			"tenant-1",
			mockVaultConnector,
			KEY_NAME
		);

		expect(url).toMatch(/^https:\/\/example\.com\/callback\?foo=bar&tenantToken=[\w-]+$/);
	});

	it("should honour a custom tenantTokenName", async () => {
		const url = await TenantUrlHelper.encrypt(
			"https://example.com/callback",
			"tenant-1",
			mockVaultConnector,
			KEY_NAME,
			"tt"
		);

		expect(url).toMatch(/^https:\/\/example\.com\/callback\?tt=[\w-]+$/);
	});

	it("should throw decryptFailed on tampered ciphertext", async () => {
		const tamperedToken = Converter.bytesToBase64Url(new Uint8Array([0x01, 0x02, 0x03]));

		await expect(
			TenantUrlHelper.decrypt(tamperedToken, mockVaultConnector, KEY_NAME)
		).rejects.toMatchObject({
			name: GeneralError.CLASS_NAME,
			source: TenantUrlHelper.CLASS_NAME,
			message: "tenantUrlHelper.decryptFailed"
		});
	});

	it("should throw decryptFailed on malformed base64url input", async () => {
		await expect(
			TenantUrlHelper.decrypt("!!!not-base64url!!!", mockVaultConnector, KEY_NAME)
		).rejects.toMatchObject({
			name: GeneralError.CLASS_NAME,
			source: TenantUrlHelper.CLASS_NAME,
			message: "tenantUrlHelper.decryptFailed"
		});
	});

	it("should throw encryptFailed when the vault connector throws", async () => {
		mockVaultConnector.encrypt = vi.fn(async () => {
			throw new Error("vault offline");
		});

		await expect(
			TenantUrlHelper.encrypt(
				"https://example.com/callback",
				"tenant-1",
				mockVaultConnector,
				KEY_NAME
			)
		).rejects.toMatchObject({
			name: GeneralError.CLASS_NAME,
			source: TenantUrlHelper.CLASS_NAME,
			message: "tenantUrlHelper.encryptFailed"
		});
	});
});
