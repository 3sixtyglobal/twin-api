// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper, type IHttpResponse } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { type IVaultConnector, VaultConnectorFactory } from "@twin.org/vault-models";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "../../src/entities/tenant.js";
import { TenantProcessor } from "../../src/tenantProcessor.js";
import { TenantUrlHelper } from "../../src/utils/tenantUrlHelper.js";

const NODE_ID = "node-1";
const SIGNING_KEY = "tenant-token-encryption";

describe("TenantProcessor", () => {
	let mockTenantStorage: IEntityStorageConnector<Tenant>;
	let mockVaultConnector: IVaultConnector;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn(),
			remove: vi.fn(),
			query: vi.fn()
		} as unknown as IEntityStorageConnector<Tenant>;

		mockVaultConnector = {
			encrypt: vi.fn(),
			decrypt: vi.fn(),
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn()
		} as unknown as IVaultConnector;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: NODE_ID
		});
	});

	describe("api-key path (back-compat)", () => {
		it("should resolve tenant from x-api-key header", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				id: "tenant-A",
				apiKey: "key-A",
				publicOrigin: "https://a.example.com"
			} as Tenant);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(processorState.publicOrigin).toBe("https://a.example.com");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("key-A", "apiKey");
		});

		it("should return 401 missingApiKey when neither header nor query carry a credential", async () => {
			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre({ headers: {} } as never, response, {} as never, {}, {});

			expect(buildResponseSpy).toHaveBeenCalled();
			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		});

		it("should skip when route opts out via skipTenant", async () => {
			const processor = new TenantProcessor();
			const response: IHttpResponse = {};

			await processor.pre(
				{ headers: {} } as never,
				response,
				{ skipTenant: true } as never,
				{},
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});
	});

	describe("tenant-token path", () => {
		const buildProcessor = (): TenantProcessor =>
			new TenantProcessor({
				vaultConnectorType: "test-vault",
				config: { signingKeyName: SIGNING_KEY }
			});

		it("api-key wins when both api-key and tenantToken are present (precedence Q1)", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				id: "tenant-from-key",
				apiKey: "key-A",
				publicOrigin: "https://key.example.com"
			} as Tenant);

			const processor = buildProcessor();
			await processor.start();

			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{
					headers: { "x-api-key": "key-A" },
					query: { tenantToken: "should-be-ignored" }
				} as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-key");
			expect(mockVaultConnector.decrypt).not.toHaveBeenCalled();
			expect(mockTenantStorage.get).toHaveBeenCalledWith("key-A", "apiKey");
		});

		it("falls back to tenantToken when no api-key present", async () => {
			vi.spyOn(TenantUrlHelper, "decrypt").mockResolvedValue("tenant-from-token");
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				id: "tenant-from-token",
				apiKey: "key-T",
				publicOrigin: "https://token.example.com"
			} as Tenant);

			const processor = buildProcessor();
			await processor.start();

			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { tenantToken: "opaque-token" } } as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-token");
			expect(processorState.publicOrigin).toBe("https://token.example.com");
			expect(TenantUrlHelper.decrypt).toHaveBeenCalledWith(
				"opaque-token",
				mockVaultConnector,
				`${NODE_ID}/${SIGNING_KEY}`
			);
			expect(mockTenantStorage.get).toHaveBeenCalledWith("tenant-from-token");
		});

		it("returns 401 tenantTokenInvalid when decryption fails", async () => {
			vi.spyOn(TenantUrlHelper, "decrypt").mockRejectedValue(new Error("bad token"));

			const processor = buildProcessor();
			await processor.start();

			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { tenantToken: "tampered" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.tenantTokenInvalid" }),
				HttpStatusCode.unauthorized
			);
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});

		it("returns 401 tenantTokenNotFound when decrypted tenant id is unknown", async () => {
			vi.spyOn(TenantUrlHelper, "decrypt").mockResolvedValue("unknown-tenant");
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);

			const processor = buildProcessor();
			await processor.start();

			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { tenantToken: "valid-shape" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.tenantTokenNotFound" }),
				HttpStatusCode.unauthorized
			);
		});

		it("ignores tenantToken when signingKeyName not configured (no vault wired)", async () => {
			vi.spyOn(TenantUrlHelper, "decrypt");
			const processor = new TenantProcessor();
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { tenantToken: "ignored-without-config" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(TenantUrlHelper.decrypt).not.toHaveBeenCalled();
			expect(VaultConnectorFactory.get).not.toHaveBeenCalled();
		});

		it("start() is a no-op when signingKeyName not configured (back-compat: no Node ID required)", async () => {
			const getContextIdsSpy = vi.spyOn(ContextIdStore, "getContextIds");
			const processor = new TenantProcessor();

			await expect(processor.start()).resolves.toBeUndefined();
			expect(getContextIdsSpy).not.toHaveBeenCalled();
		});

		it("start() guards Node when vault + signingKeyName are both configured", async () => {
			const getContextIdsSpy = vi.spyOn(ContextIdStore, "getContextIds");
			const processor = new TenantProcessor({
				vaultConnectorType: "test-vault",
				config: { signingKeyName: SIGNING_KEY }
			});

			await processor.start();
			expect(getContextIdsSpy).toHaveBeenCalled();
		});

		it("start() is a no-op when signingKeyName is set but vault is not wired (defensive)", async () => {
			const getContextIdsSpy = vi.spyOn(ContextIdStore, "getContextIds");
			const processor = new TenantProcessor({ config: { signingKeyName: SIGNING_KEY } });

			await expect(processor.start()).resolves.toBeUndefined();
			expect(getContextIdsSpy).not.toHaveBeenCalled();
		});
	});
});
