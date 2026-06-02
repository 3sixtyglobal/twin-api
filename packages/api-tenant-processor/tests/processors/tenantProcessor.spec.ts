// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IHttpResponse,
	type IUrlTransformerComponent
} from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import { ComponentFactory } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "../../src/entities/tenant.js";
import { TenantProcessor } from "../../src/tenantProcessor.js";

const LOGIN_URL = "/api/login";

const TENANT_A: Tenant = {
	id: "tenant-A",
	apiKey: "key-A",
	publicOrigin: "https://a.example.com",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	isNodeTenant: false,
	label: "Tenant A"
};

describe("TenantProcessor", () => {
	let mockTenantStorage: IEntityStorageConnector<Tenant>;
	let mockUrlTransformerComponent: IUrlTransformerComponent;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn(),
			remove: vi.fn(),
			query: vi.fn()
		} as unknown as IEntityStorageConnector<Tenant>;

		mockUrlTransformerComponent = {
			className: vi.fn(),
			getEncryptedQueryParam: vi.fn().mockResolvedValue(undefined),
			addEncryptedQueryParamToUrl: vi.fn(),
			getEncryptedFromUrl: vi.fn(),
			addEncryptedToUrl: vi.fn(),
			getDecryptedFromQueryParams: vi.fn(),
			encryptQueryParams: vi.fn(),
			decryptQueryParams: vi.fn(),
			encryptParam: vi.fn(),
			decryptParam: vi.fn(),
			getParamName: vi.fn()
		};

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
		vi.spyOn(ComponentFactory, "get").mockReturnValue(mockUrlTransformerComponent);
	});

	describe("api-key path", () => {
		it("should resolve tenant from x-api-key header", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: LOGIN_URL, headers: { "x-api-key": "key-A" } } as never,
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

			await processor.pre({ url: LOGIN_URL, headers: {} } as never, response, {} as never, {}, {});

			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingApiKey" }),
				HttpStatusCode.unauthorized
			);
			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		});

		it("should skip when route opts out via skipTenant", async () => {
			const processor = new TenantProcessor();
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: LOGIN_URL, headers: {} } as never,
				response,
				{ skipTenant: true } as never,
				{},
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});

		it("should return 401 apiKeyNotFound when api key is not in storage", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: LOGIN_URL, headers: { "x-api-key": "unknown-key" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.apiKeyNotFound" }),
				HttpStatusCode.unauthorized
			);
		});
	});

	describe("tenant-token path", () => {
		it("api-key wins when both api-key and tenant-token are present", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				...TENANT_A,
				id: "tenant-from-key",
				publicOrigin: "https://key.example.com"
			});

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{
					url: LOGIN_URL,
					headers: { "x-api-key": "key-A" },
					query: { "tenant-token": "should-be-ignored" }
				} as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-key");
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).not.toHaveBeenCalled();
			expect(mockTenantStorage.get).toHaveBeenCalledWith("key-A", "apiKey");
		});

		it("resolves tenant from token on a non-api-key-endpoint URL", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(
				"tenant-from-token"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				...TENANT_A,
				id: "tenant-from-token",
				publicOrigin: "https://token.example.com"
			});

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{ url: "/api/users", headers: {}, query: { "tenant-token": "opaque-token" } } as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-token");
			expect(processorState.publicOrigin).toBe("https://token.example.com");
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).toHaveBeenCalledWith(
				{ "tenant-token": "opaque-token" },
				"tenant"
			);
			expect(mockTenantStorage.get).toHaveBeenCalledWith("tenant-from-token");
		});

		it("returns 401 tenantNotFound when token resolves but tenant is unknown", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(
				"unknown-tenant"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ url: "/api/users", headers: {}, query: { "tenant-token": "valid-shape" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.tenantNotFound" }),
				HttpStatusCode.unauthorized
			);
		});

		it("returns 401 missingApiKey when no api key is provided on an api-key endpoint", async () => {
			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ url: LOGIN_URL, headers: {}, query: {} } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingApiKey" }),
				HttpStatusCode.unauthorized
			);
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).not.toHaveBeenCalled();
		});

		it("returns 401 when token decryption throws on a non-api-key-endpoint URL", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockRejectedValue(
				new Error("decryption failed")
			);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ url: "/api/users", headers: {}, query: { "tenant-token": "tampered" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalled();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});
	});

	describe("skipAuth path", () => {
		it("resolves tenant from encrypted query param when skipAuth is true", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(
				"tenant-from-token"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue({ ...TENANT_A, id: "tenant-from-token" });

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/some-endpoint", headers: {}, query: { tt: "opaque-token" } } as never,
				response,
				{ skipAuth: true } as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-token");
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).toHaveBeenCalledWith(
				{ tt: "opaque-token" },
				"tenant"
			);
			expect(mockTenantStorage.get).toHaveBeenCalledWith("tenant-from-token");
		});

		it("returns 401 missingTenantToken when encrypted query param is absent on skipAuth route", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(undefined);
			vi.mocked(mockUrlTransformerComponent.getParamName).mockReturnValue("tenant-token");

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/some-endpoint", headers: {}, query: {} } as never,
				response,
				{ skipAuth: true } as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingTenantToken" }),
				HttpStatusCode.unauthorized
			);
		});

		it("returns 401 missingTenantToken on a non-api-key-endpoint route when skipAuth is true and no token", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(undefined);
			vi.mocked(mockUrlTransformerComponent.getParamName).mockReturnValue("tenant-token");

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/some-endpoint", headers: {}, query: {} } as never,
				response,
				{ skipAuth: true } as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingTenantToken" }),
				HttpStatusCode.unauthorized
			);
		});
	});

	describe("apiKeyEndpoints", () => {
		it("passes through without tenant resolution when URL does not match default pattern and no tenant token", async () => {
			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).toHaveBeenCalled();
		});

		it("resolves tenant via token on a non-matching URL when tenant token is present", async () => {
			vi.mocked(mockUrlTransformerComponent.getEncryptedQueryParam).mockResolvedValue(
				"tenant-from-token"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				...TENANT_A,
				id: "tenant-from-token"
			});

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: {} } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-token");
			expect(mockTenantStorage.get).not.toHaveBeenCalledWith(expect.anything(), "apiKey");
		});

		it("default pattern matches URL ending in /login", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/v1/auth/login", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
		});

		it("default pattern does not match URL with /login in the middle", async () => {
			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/login/callback", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).toHaveBeenCalled();
		});

		it("uses custom apiKeyEndpoints when provided", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor({
				config: { apiKeyEndpoints: ["^/auth/token$"] }
			});
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/auth/token", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
		});

		it("passes through when URL does not match custom apiKeyEndpoints and no tenant token", async () => {
			const processor = new TenantProcessor({
				config: { apiKeyEndpoints: ["^/auth/token$"] }
			});
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: LOGIN_URL, headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
			expect(mockUrlTransformerComponent.getEncryptedQueryParam).toHaveBeenCalled();
		});

		it("matches any of multiple configured patterns", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor({
				config: { apiKeyEndpoints: ["/login$", "^/auth/token$"] }
			});
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/auth/token", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
		});

		it("matches the path even when the URL contains a query string", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/login?x-api-key=key-A", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
		});

		it("does not match when the query string contains /login but the path does not end with it", async () => {
			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users?redirect=/login", headers: { "x-api-key": "key-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			// Path is /api/users which doesn't match /login$ — should pass through.
			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});
	});
});
