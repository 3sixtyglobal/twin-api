// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpUrlHelper, type ITenantAdminComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory, Converter } from "@twin.org/core";
import {
	type IVaultConnector,
	VaultConnectorFactory,
	VaultEncryptionType
} from "@twin.org/vault-models";
import { HostingService } from "../src/hostingService.js";

const NODE_ID = "test-node-id";
const LOCAL_ORIGIN = "http://localhost:3000";
const PUBLIC_ORIGIN = "https://api.example.com";
const TENANT_ID = "a".repeat(32);

describe("HostingService", () => {
	let mockVaultConnector: IVaultConnector;
	let mockTenantAdminComponent: ITenantAdminComponent;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockVaultConnector = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn(),
			encrypt: vi.fn(),
			decrypt: vi.fn()
		} as unknown as IVaultConnector;

		mockTenantAdminComponent = {
			className: vi.fn().mockReturnValue("TenantAdminComponent"),
			get: vi.fn()
		} as unknown as ITenantAdminComponent;

		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: NODE_ID
		});
		vi.spyOn(VaultConnectorFactory, "getIfExists").mockReturnValue(mockVaultConnector);
		vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(undefined);
	});

	describe("constructor", () => {
		test("throws when options is missing", () => {
			expect(() => new HostingService(undefined as never)).toThrow();
		});

		test("throws when options.config is missing", () => {
			expect(() => new HostingService({} as never)).toThrow();
		});

		test("throws when localOrigin is missing", () => {
			expect(() => new HostingService({ config: {} as never })).toThrow();
		});

		test("creates an instance with minimal config", () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			expect(service).toBeDefined();
		});

		test("creates an instance with full config", () => {
			const service = new HostingService({
				tenantAdminComponentType: "custom-tenant-admin",
				vaultConnectorType: "custom-vault",
				config: {
					localOrigin: LOCAL_ORIGIN,
					publicOrigin: PUBLIC_ORIGIN,
					paramEncryptionKeyName: "custom-key"
				}
			});
			expect(service).toBeDefined();
		});
	});

	describe("className", () => {
		test("returns HostingService", () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			expect(service.className()).toBe("HostingService");
		});
	});

	describe("start", () => {
		test("resolves when node context id is present", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.start()).resolves.toBeUndefined();
			expect(ContextIdStore.getContextIds).toHaveBeenCalled();
		});
	});

	describe("getPublicOrigin", () => {
		test("returns tenant public origin when tenant context is set and tenant has an origin", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
				[ContextIdKeys.Node]: NODE_ID,
				[ContextIdKeys.Tenant]: TENANT_ID
			});
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: "https://tenant.example.com"
			} as never);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await service.start();

			await expect(service.getPublicOrigin()).resolves.toBe("https://tenant.example.com");
		});

		test("falls back to configured public origin when no tenant context", async () => {
			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await service.start();

			await expect(service.getPublicOrigin()).resolves.toBe(PUBLIC_ORIGIN);
		});

		test("falls back to server request origin when no public origin is configured", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue("http://request.example.com");

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(service.getPublicOrigin("http://request.example.com/api/v1")).resolves.toBe(
				"http://request.example.com"
			);
		});

		test("falls back to local origin as last resort", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(service.getPublicOrigin()).resolves.toBe(LOCAL_ORIGIN);
		});

		test("falls back to public origin when tenant has no public origin", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
				[ContextIdKeys.Node]: NODE_ID,
				[ContextIdKeys.Tenant]: TENANT_ID
			});
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: undefined
			} as never);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await service.start();

			await expect(service.getPublicOrigin()).resolves.toBe(PUBLIC_ORIGIN);
		});
	});

	describe("getTenantOrigin", () => {
		test("throws when tenantId is not a 32-char hex string", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin("invalid")).rejects.toThrow();
		});

		test("returns undefined when no tenant admin component is registered", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBeUndefined();
		});

		test("returns the tenant public origin when the component and tenant exist", async () => {
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: "https://tenant.example.com"
			} as never);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBe("https://tenant.example.com");
			expect(mockTenantAdminComponent.get).toHaveBeenCalledWith(TENANT_ID);
		});

		test("returns undefined when tenant has no public origin", async () => {
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: undefined
			} as never);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBeUndefined();
		});
	});

	describe("buildPublicUrl", () => {
		test("replaces origin with configured public origin", async () => {
			vi.spyOn(HttpUrlHelper, "replaceOrigin").mockReturnValue(`${PUBLIC_ORIGIN}/some/path`);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await service.start();

			await expect(service.buildPublicUrl(`${LOCAL_ORIGIN}/some/path`)).resolves.toBe(
				`${PUBLIC_ORIGIN}/some/path`
			);
			expect(HttpUrlHelper.replaceOrigin).toHaveBeenCalledWith(
				`${LOCAL_ORIGIN}/some/path`,
				PUBLIC_ORIGIN
			);
		});
	});

	describe("addEncryptedParamsToUrl", () => {
		test("encrypts all provided params and adds them with x-enc- prefix", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.addEncryptedParamsToUrl(`${LOCAL_ORIGIN}/api`, {
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

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.addEncryptedParamsToUrl(`${LOCAL_ORIGIN}/api?foo=bar&baz=qux`, {
				token: "abc"
			});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(resultUrl.searchParams.get("baz")).toBe("qux");
			expect(resultUrl.searchParams.get("x-enc-token")).toBeDefined();
		});

		test("throws when vault connector is unavailable", async () => {
			vi.spyOn(VaultConnectorFactory, "getIfExists").mockReturnValue(undefined);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(
				service.addEncryptedParamsToUrl(`${LOCAL_ORIGIN}/api`, { token: "abc" })
			).rejects.toMatchObject({ message: "hostingService.encryptionUnavailable" });
		});

		test("returns url with existing params unchanged when params is empty", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.addEncryptedParamsToUrl(`${LOCAL_ORIGIN}/api?foo=bar`, {});
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});
	});

	describe("addTenantTokenToUrl", () => {
		test("adds encrypted tenant token as x-enc- prefixed query param", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.addTenantTokenToUrl(`${LOCAL_ORIGIN}/api`, TENANT_ID);
			const resultUrl = new URL(result);

			const encryptedParam = resultUrl.searchParams.get("x-enc-tenant-token");
			expect(encryptedParam).toBe(Converter.bytesToBase64Url(fakeEncrypted));
			expect(resultUrl.searchParams.get("tenant-token")).toBeNull();
		});

		test("uses custom tenantTokenName in the query param key", async () => {
			const fakeEncrypted = new Uint8Array([1, 2, 3]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, tenantTokenName: "my-token" }
			});
			await service.start();

			const result = await service.addTenantTokenToUrl(`${LOCAL_ORIGIN}/api`, TENANT_ID);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("x-enc-my-token")).toBe(
				Converter.bytesToBase64Url(fakeEncrypted)
			);
			expect(resultUrl.searchParams.get("my-token")).toBeNull();
		});

		test("preserves existing query params on the url", async () => {
			const fakeEncrypted = new Uint8Array([5, 6, 7]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.addTenantTokenToUrl(`${LOCAL_ORIGIN}/api?foo=bar`, TENANT_ID);
			const resultUrl = new URL(result);

			expect(resultUrl.searchParams.get("foo")).toBe("bar");
			expect(resultUrl.searchParams.get("x-enc-tenant-token")).toBeDefined();
		});

		test("throws when vault connector is unavailable", async () => {
			vi.spyOn(VaultConnectorFactory, "getIfExists").mockReturnValue(undefined);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(
				service.addTenantTokenToUrl(`${LOCAL_ORIGIN}/api`, TENANT_ID)
			).rejects.toMatchObject({ message: "hostingService.encryptionUnavailable" });
		});
	});

	describe("getDecryptedParamsFromQueryParams", () => {
		test("returns empty object when queryParams is undefined", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();
			await expect(
				service.getDecryptedParamsFromQueryParams(undefined, ["token"])
			).resolves.toEqual({});
		});

		test("decrypts requested keys and returns only those keys", async () => {
			const originalValue = "my-secret";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getDecryptedParamsFromQueryParams(
				{ "x-enc-token": encryptedValue, other: "plain" },
				["token"]
			);

			expect(result).toEqual({ token: originalValue });
			expect(result.other).toBeUndefined();
		});

		test("omits keys that are absent from the query params", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const result = await service.getDecryptedParamsFromQueryParams({ "x-enc-other": "value" }, [
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

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const enc = Converter.bytesToBase64Url(new Uint8Array([1]));
			const result = await service.getDecryptedParamsFromQueryParams(
				{ "x-enc-alpha": enc, "x-enc-beta": enc },
				["alpha", "beta"]
			);

			expect(result).toEqual({ alpha: "value-a", beta: "value-b" });
		});
	});

	describe("getTenantTokenFromQueryParams", () => {
		test("returns undefined when queryParams is undefined", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();
			await expect(service.getTenantTokenFromQueryParams(undefined)).resolves.toBeUndefined();
		});

		test("returns the decrypted tenant token", async () => {
			const originalValue = "my-tenant-id";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getTenantTokenFromQueryParams({
				"x-enc-tenant-token": encryptedValue
			});

			expect(result).toBe(originalValue);
		});

		test("returns undefined when tenant token is absent from query params", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();
			await expect(
				service.getTenantTokenFromQueryParams({ other: "value" })
			).resolves.toBeUndefined();
		});

		test("uses custom tenantTokenName", async () => {
			const originalValue = "tenant-xyz";
			const valueBytes = Converter.utf8ToBytes(originalValue);
			const decryptedWithSalt = new Uint8Array(8 + valueBytes.length);
			decryptedWithSalt.set(valueBytes, 8);
			vi.mocked(mockVaultConnector.decrypt).mockResolvedValue(decryptedWithSalt);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, tenantTokenName: "my-token" }
			});
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const result = await service.getTenantTokenFromQueryParams({
				"x-enc-my-token": encryptedValue
			});

			expect(result).toBe(originalValue);
		});
	});

	describe("encryptQueryParams", () => {
		test("returns early when httpRequestQuery is undefined", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();
			await expect(service.encryptQueryParams(undefined, ["token"])).resolves.toBeUndefined();
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});

		test("encrypts specified keys and adds x-enc- prefix", async () => {
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(new Uint8Array([1, 2, 3]));

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const query: { [key: string]: string } = { token: "my-secret", other: "plain" };
			await service.encryptQueryParams(query, ["token"]);

			expect(query["x-enc-token"]).toBeDefined();
			expect(query.token).toBeUndefined();
			expect(query.other).toBe("plain");
		});

		test("does not modify keys that are not in the keys list", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const query: { [key: string]: string } = { other: "plain" };
			await service.encryptQueryParams(query, ["token"]);

			expect(query).toEqual({ other: "plain" });
			expect(mockVaultConnector.encrypt).not.toHaveBeenCalled();
		});
	});

	describe("decryptQueryParams", () => {
		test("returns early when httpRequestQuery is undefined", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
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

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			const query: { [key: string]: string } = { "x-enc-token": encryptedValue, other: "plain" };
			await service.decryptQueryParams(query, ["token"]);

			expect(query.token).toBe(originalValue);
			expect(query["x-enc-token"]).toBeUndefined();
			expect(query.other).toBe("plain");
		});

		test("does not decrypt x-enc- keys that are not in the keys list", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const query: { [key: string]: string } = { "x-enc-other": "encrypted" };
			await service.decryptQueryParams(query, ["token"]);

			expect(query).toEqual({ "x-enc-other": "encrypted" });
			expect(mockVaultConnector.decrypt).not.toHaveBeenCalled();
		});
	});

	describe("encryptParam", () => {
		test("throws when paramValue is empty", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.encryptParam("")).rejects.toThrow();
		});

		test("throws GeneralError encryptionUnavailable when no vault connector", async () => {
			vi.spyOn(VaultConnectorFactory, "getIfExists").mockReturnValue(undefined);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(service.encryptParam("value")).rejects.toMatchObject({
				message: "hostingService.encryptionUnavailable"
			});
		});

		test("throws encryptionUnavailable when node id is not set", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			await expect(service.encryptParam("value")).rejects.toMatchObject({
				message: "hostingService.encryptionUnavailable"
			});
		});

		test("returns base64url-encoded encrypted value", async () => {
			const fakeEncrypted = new Uint8Array([10, 20, 30, 40]);
			vi.mocked(mockVaultConnector.encrypt).mockResolvedValue(fakeEncrypted);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
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

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, paramEncryptionKeyName: "custom-key" }
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
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.decryptParam("")).rejects.toThrow();
		});

		test("throws GeneralError decryptionUnavailable when no vault connector", async () => {
			vi.spyOn(VaultConnectorFactory, "getIfExists").mockReturnValue(undefined);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			await expect(service.decryptParam(encryptedValue)).rejects.toMatchObject({
				message: "hostingService.decryptionUnavailable"
			});
		});

		test("throws decryptionUnavailable when node id is not set", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await service.start();

			const encryptedValue = Converter.bytesToBase64Url(new Uint8Array([1, 2, 3]));
			await expect(service.decryptParam(encryptedValue)).rejects.toMatchObject({
				message: "hostingService.decryptionUnavailable"
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

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
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

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, paramEncryptionKeyName: "custom-key" }
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
