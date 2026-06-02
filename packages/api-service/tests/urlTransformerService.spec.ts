// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Converter } from "@twin.org/core";
import {
	type IVaultConnector,
	VaultConnectorFactory,
	VaultEncryptionType
} from "@twin.org/vault-models";
import { UrlTransformerService } from "../src/urlTransformerService.js";

const NODE_ID = "test-node-id";
const LOCAL_ORIGIN = "http://localhost:3000";
const TENANT_ID = "a".repeat(32);

describe("UrlTransformerService", () => {
	let mockVaultConnector: IVaultConnector;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockVaultConnector = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn(),
			encrypt: vi.fn(),
			decrypt: vi.fn()
		} as unknown as IVaultConnector;

		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: NODE_ID
		});
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);
	});

	describe("constructor", () => {
		test("creates an instance with no options", () => {
			const service = new UrlTransformerService();
			expect(service).toBeDefined();
		});

		test("creates an instance with full options", () => {
			const service = new UrlTransformerService({
				vaultConnectorType: "custom-vault",
				config: {
					paramEncryptionKeyName: "custom-key",
					queryParamNames: { tenant: "tenant-token" }
				}
			});
			expect(service).toBeDefined();
		});
	});

	describe("className", () => {
		test("returns UrlTransformerService", () => {
			const service = new UrlTransformerService();
			expect(service.className()).toBe("UrlTransformerService");
		});
	});

	describe("start", () => {
		test("captures node id from context store", async () => {
			const service = new UrlTransformerService();
			await expect(service.start()).resolves.toBeUndefined();
			expect(ContextIdStore.getContextIds).toHaveBeenCalled();
		});
	});

	describe("addEncryptedToUrl", () => {
		test("encrypts all provided params and adds them with x-enc- prefix", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedToUrl(`${LOCAL_ORIGIN}/api`, {
				token: "abc",
				secret: "xyz"
			});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("x-enc-secret")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("token")).toBeNull();
			expect(resultUrl.searchParams.get("secret")).toBeNull();
		});

		test("preserves existing url query params unchanged", async () => {
			const fakeEncrypted = new Uint8Array([1, 2, 3]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedToUrl(`${LOCAL_ORIGIN}/api?foo=bar&baz=qux`, {
				token: "abc"
			});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(resultUrl.searchParams.get("baz")).toBe("qux");
			expect(resultUrl.searchParams.get("x-enc-token")).toBeDefined();
		});

		test("throws encryptionUnavailable when start has not been called", async () => {
			const service = new UrlTransformerService();

			await expect(
				service.addEncryptedToUrl(`${LOCAL_ORIGIN}/api`, { token: "abc" })
			).rejects.toMatchObject({ message: "urlTransformerService.encryptionUnavailable" });
		});

		test("returns url with existing params unchanged when params is empty", async () => {
			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedToUrl(`${LOCAL_ORIGIN}/api?foo=bar`, {});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});

		test("overwrites an existing plain-text param with its encrypted form", async () => {
			const fakeEncrypted = new Uint8Array([7, 8, 9]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedToUrl(`${LOCAL_ORIGIN}/api?token=old`, {
				token: "new"
			});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("token")).toBeNull();
			expect(resultUrl.searchParams.get("x-enc-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
		});

		test("overwrites an existing encrypted param when the same key is re-encrypted", async () => {
			const fakeEncrypted = new Uint8Array([4, 5, 6]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedToUrl(
				`${LOCAL_ORIGIN}/api?x-enc-token=staleEncrypted`,
				{ token: "new" }
			);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
		});

		test("returns the original string unchanged when the url is invalid", async () => {
			const service = new UrlTransformerService();
			await service.start();

			const invalid = "not a valid url";
			await expect(service.addEncryptedToUrl(invalid, { token: "abc" })).resolves.toBe(invalid);
		});

		test("returns the original string unchanged when the url is empty", async () => {
			const service = new UrlTransformerService();
			await service.start();

			await expect(service.addEncryptedToUrl("", { token: "abc" })).resolves.toBe("");
		});
	});

	describe("addEncryptedQueryParamToUrl", () => {
		test("adds encrypted token using id as param name when no queryParamNames config", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.addEncryptedQueryParamToUrl(
				`${LOCAL_ORIGIN}/api`,
				"tenant",
				TENANT_ID
			);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-tenant")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("tenant")).toBeNull();
		});

		test("adds encrypted token using configured param name for the id", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();

			const result = await service.addEncryptedQueryParamToUrl(
				`${LOCAL_ORIGIN}/api`,
				"tenant",
				TENANT_ID
			);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-tenant-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("tenant-token")).toBeNull();
		});

		test("uses custom param name from queryParamNames dictionary", async () => {
			const fakeEncrypted = new Uint8Array([1, 2, 3]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "my-token" } }
			});
			await service.start();

			const result = await service.addEncryptedQueryParamToUrl(
				`${LOCAL_ORIGIN}/api`,
				"tenant",
				TENANT_ID
			);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-my-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("my-token")).toBeNull();
		});

		test("preserves existing query params on the url", async () => {
			const fakeEncrypted = new Uint8Array([5, 6, 7]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();

			const result = await service.addEncryptedQueryParamToUrl(
				`${LOCAL_ORIGIN}/api?foo=bar`,
				"tenant",
				TENANT_ID
			);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(resultUrl.searchParams.get("x-enc-tenant-token")).toBeDefined();
		});

		test("throws encryptionUnavailable when start has not been called", async () => {
			const service = new UrlTransformerService();

			await expect(
				service.addEncryptedQueryParamToUrl(`${LOCAL_ORIGIN}/api`, "tenant", TENANT_ID)
			).rejects.toMatchObject({ message: "urlTransformerService.encryptionUnavailable" });
		});
	});

	describe("getDecryptedFromQueryParams", () => {
		test("returns empty object when queryParams is undefined", async () => {
			const service = new UrlTransformerService();
			await service.start();
			await expect(service.getDecryptedFromQueryParams(undefined, ["token"])).resolves.toEqual({});
		});

		test("decrypts requested keys and returns only those keys", async () => {
			const originalValue = "my-secret";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService();
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getDecryptedFromQueryParams(
				{ "x-enc-token": encryptedValue, other: "plain" },
				["token"]
			);

			expect(result).toEqual({ token: originalValue });
			expect(result.other).toBeUndefined();
		});

		test("omits keys that are absent from the query params", async () => {
			const service = new UrlTransformerService();
			await service.start();

			const result = await service.getDecryptedFromQueryParams({ "x-enc-other": "value" }, [
				"token",
				"secret"
			]);

			expect(result).toEqual({});
			expect(mockVaultConnector.decrypt).not.toHaveBeenCalled();
		});

		test("decrypts multiple requested keys", async () => {
			const makeDecrypted = (v: string): Uint8Array => {
				const vBytes = Converter.utf8ToBytes(v);
				const buf = new Uint8Array(8 + vBytes.length);
				buf.set(vBytes, 8);
				return buf;
			};
			vi.mocked(mockVaultConnector.decrypt)
				.mockResolvedValueOnce(makeDecrypted("value-a"))
				.mockResolvedValueOnce(makeDecrypted("value-b"));

			const service = new UrlTransformerService();
			await service.start();

			const enc = Converter.bytesToBase64Url(new Uint8Array([1]));
			const result = await service.getDecryptedFromQueryParams(
				{ "x-enc-alpha": enc, "x-enc-beta": enc },
				["alpha", "beta"]
			);

			expect(result).toEqual({ alpha: "value-a", beta: "value-b" });
		});
	});

	describe("getEncryptedQueryParam", () => {
		test("returns undefined when queryParams is undefined", async () => {
			const service = new UrlTransformerService();
			await service.start();
			await expect(service.getEncryptedQueryParam(undefined, "tenant")).resolves.toBeUndefined();
		});

		test("returns the decrypted token using id as param name when no queryParamNames config", async () => {
			const originalValue = "my-tenant-id";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService();
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getEncryptedQueryParam(
				{ "x-enc-tenant": encryptedValue },
				"tenant"
			);

			expect(result).toBe(originalValue);
		});

		test("returns the decrypted token using configured param name for the id", async () => {
			const originalValue = "my-tenant-id";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getEncryptedQueryParam(
				{ "x-enc-tenant-token": encryptedValue },
				"tenant"
			);

			expect(result).toBe(originalValue);
		});

		test("uses custom param name from queryParamNames dictionary", async () => {
			const originalValue = "tenant-xyz";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "my-token" } }
			});
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getEncryptedQueryParam(
				{ "x-enc-my-token": encryptedValue },
				"tenant"
			);

			expect(result).toBe(originalValue);
		});

		test("returns undefined when token is absent from query params", async () => {
			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();
			await expect(
				service.getEncryptedQueryParam({ other: "value" }, "tenant")
			).resolves.toBeUndefined();
		});
	});

	describe("getEncryptedFromUrl", () => {
		test("returns undefined when url is invalid", async () => {
			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();
			await expect(service.getEncryptedFromUrl("not a url", "tenant")).resolves.toBeUndefined();
		});

		test("returns undefined when url is empty", async () => {
			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();
			await expect(service.getEncryptedFromUrl("", "tenant")).resolves.toBeUndefined();
		});

		test("returns undefined when key has no queryParamNames mapping", async () => {
			const service = new UrlTransformerService();
			await service.start();
			await expect(
				service.getEncryptedFromUrl(`${LOCAL_ORIGIN}/api?x-enc-tenant=abc`, "tenant")
			).resolves.toBeUndefined();
		});

		test("returns undefined when mapped param is absent from the url", async () => {
			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();
			await expect(
				service.getEncryptedFromUrl(`${LOCAL_ORIGIN}/api?other=value`, "tenant")
			).resolves.toBeUndefined();
		});

		test("returns the decrypted value when the mapped param is present", async () => {
			const originalValue = "my-tenant-id";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const url = `${LOCAL_ORIGIN}/api?x-enc-tenant-token=${encodeURIComponent(encryptedValue)}`;
			const result = await service.getEncryptedFromUrl(url, "tenant");
			expect(result).toBe(originalValue);
		});

		test("uses the mapped param name from queryParamNames, not the raw key", async () => {
			const originalValue = "value-xyz";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService({
				config: { queryParamNames: { myKey: "mapped-name" } }
			});
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([4, 5, 6]));
			const urlWithMappedName = `${LOCAL_ORIGIN}/api?x-enc-mapped-name=${encodeURIComponent(encryptedValue)}`;
			const urlWithRawKey = `${LOCAL_ORIGIN}/api?x-enc-myKey=${encodeURIComponent(encryptedValue)}`;

			await expect(service.getEncryptedFromUrl(urlWithMappedName, "myKey")).resolves.toBe(
				originalValue
			);
			await expect(service.getEncryptedFromUrl(urlWithRawKey, "myKey")).resolves.toBeUndefined();
		});

		test("throws decryptionUnavailable when start has not been called", async () => {
			const service = new UrlTransformerService({
				config: { queryParamNames: { tenant: "tenant-token" } }
			});

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const url = `${LOCAL_ORIGIN}/api?x-enc-tenant-token=${encodeURIComponent(encryptedValue)}`;
			await expect(service.getEncryptedFromUrl(url, "tenant")).rejects.toMatchObject({
				message: "urlTransformerService.decryptionUnavailable"
			});
		});
	});

	describe("encryptQueryParams", () => {
		test("returns early when httpRequestQuery is undefined", async () => {
			const service = new UrlTransformerService();
			await service.start();
			await expect(service.encryptQueryParams(undefined, ["token"])).resolves.toBeUndefined();
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});

		test("encrypts specified keys and adds x-enc- prefix", async () => {
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(new Uint8Array([1, 2, 3]));

			const service = new UrlTransformerService();
			await service.start();

			const query: { [key: string]: string } = { token: "my-secret", other: "plain" };
			await service.encryptQueryParams(query, ["token"]);

			expect(query["x-enc-token"]).toBeDefined();
			expect(query.token).toBeUndefined();
			expect(query.other).toBe("plain");
		});

		test("does not modify keys that are not in the keys list", async () => {
			const service = new UrlTransformerService();
			await service.start();

			const query: { [key: string]: string } = { other: "plain" };
			await service.encryptQueryParams(query, ["token"]);

			expect(query).toEqual({ other: "plain" });
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});
	});

	describe("decryptQueryParams", () => {
		test("returns early when httpRequestQuery is undefined", async () => {
			const service = new UrlTransformerService();
			await service.start();
			await expect(service.decryptQueryParams(undefined, ["token"])).resolves.toBeUndefined();
			expect(mockVaultConnector.decrypt).not.toHaveBeenCalled();
		});

		test("decrypts x-enc- prefixed keys and restores original name", async () => {
			const originalValue = "my-secret";
			const salt = new Uint8Array(8);
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(salt);
			decryptedWithSalt.set(valueBytes, 8);

			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService();
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const query: { [key: string]: string } = { "x-enc-token": encryptedValue, other: "plain" };
			await service.decryptQueryParams(query, ["token"]);

			expect(query.token).toBe(originalValue);
			expect(query["x-enc-token"]).toBeUndefined();
			expect(query.other).toBe("plain");
		});

		test("does not decrypt x-enc- keys that are not in the keys list", async () => {
			const service = new UrlTransformerService();
			await service.start();

			const query: { [key: string]: string } = { "x-enc-other": "encrypted" };
			await service.decryptQueryParams(query, ["token"]);

			expect(query).toEqual({ "x-enc-other": "encrypted" });
			expect(mockVaultConnector.decrypt).not.toHaveBeenCalled();
		});
	});

	describe("encryptParam", () => {
		test("throws when paramValue is empty", async () => {
			const service = new UrlTransformerService();
			await expect(service.encryptParam("")).rejects.toThrow();
		});

		test("throws encryptionUnavailable when node id is not set", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});

			const service = new UrlTransformerService();
			await service.start();

			await expect(service.encryptParam("value")).rejects.toMatchObject({
				message: "urlTransformerService.encryptionUnavailable"
			});
		});

		test("returns base64url-encoded encrypted value", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30, 40]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService();
			await service.start();

			const result = await service.encryptParam("my-value");
			expect(result).toBe(Converter.bytesToBase64Url(fakeEncrypted));
			expect(mockVaultConnector.encrypt).toHaveBeenCalledWith(
				`${NODE_ID}/param-encryption`,
				VaultEncryptionType.ChaCha20Poly1305,
				expect.any(Uint8Array)
			);
		});

		test("uses custom paramEncryptionKeyName", async () => {
			const fakeEncrypted = new Uint8Array([1, 2, 3]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new UrlTransformerService({
				config: { paramEncryptionKeyName: "custom-key" }
			});
			await service.start();

			await service.encryptParam("value");
			expect(mockVaultConnector.encrypt).toHaveBeenCalledWith(
				`${NODE_ID}/custom-key`,
				VaultEncryptionType.ChaCha20Poly1305,
				expect.any(Uint8Array)
			);
		});
	});

	describe("decryptParam", () => {
		test("throws when encryptedValue is empty", async () => {
			const service = new UrlTransformerService();
			await expect(service.decryptParam("")).rejects.toThrow();
		});

		test("throws decryptionUnavailable when node id is not set", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});

			const service = new UrlTransformerService();
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			await expect(service.decryptParam(encryptedValue)).rejects.toMatchObject({
				message: "urlTransformerService.decryptionUnavailable"
			});
		});

		test("returns the decrypted value stripping the 8-byte salt prefix", async () => {
			const originalValue = "secret-value";
			const salt = new Uint8Array(8).fill(42);
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(salt);
			decryptedWithSalt.set(valueBytes, 8);

			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService();
			await service.start();

			const encryptedInput = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3, 4]));
			const result = await service.decryptParam(encryptedInput);
			expect(result).toBe(originalValue);
			expect(mockVaultConnector.decrypt).toHaveBeenCalledWith(
				`${NODE_ID}/param-encryption`,
				VaultEncryptionType.ChaCha20Poly1305,
				expect.any(Uint8Array)
			);
		});

		test("uses custom paramEncryptionKeyName when decrypting", async () => {
			const originalValue = "value";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);

			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new UrlTransformerService({
				config: { paramEncryptionKeyName: "custom-key" }
			});
			await service.start();

			const encryptedInput = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			await service.decryptParam(encryptedInput);
			expect(mockVaultConnector.decrypt).toHaveBeenCalledWith(
				`${NODE_ID}/custom-key`,
				VaultEncryptionType.ChaCha20Poly1305,
				expect.any(Uint8Array)
			);
		});
	});
});
