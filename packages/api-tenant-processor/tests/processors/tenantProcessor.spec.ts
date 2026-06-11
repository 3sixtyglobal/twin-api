// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper, type IHttpResponse } from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
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
	organizationId: "org-A",
	organizationIdLegacy: "|org-legacy-1|org-legacy-2|",
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	label: "Tenant A"
};

describe("TenantProcessor", () => {
	let mockTenantStorage: IEntityStorageConnector<Tenant>;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn().mockResolvedValue(undefined),
			remove: vi.fn(),
			query: vi.fn().mockResolvedValue({ entities: [] })
		} as unknown as IEntityStorageConnector<Tenant>;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
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
			expect(contextIds[ContextIdKeys.Organization]).toBe("org-A");
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

	describe("organization- path", () => {
		it("resolves tenant by exact organizationId", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: {}, query: { organization: "org-A" } } as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(contextIds[ContextIdKeys.Organization]).toBe("org-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
			expect(mockTenantStorage.query).not.toHaveBeenCalled();
		});

		it("resolves tenant by organizationIdLegacy pipe-delimited match", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);
			vi.mocked(mockTenantStorage.query).mockResolvedValue({ entities: [TENANT_A] });

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{
					url: "/api/users",
					headers: {},
					query: { organization: "org-legacy-1" }
				} as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(contextIds[ContextIdKeys.Organization]).toBe("org-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-legacy-1", "organizationId");
			expect(mockTenantStorage.query).toHaveBeenCalledWith({
				property: "organizationIdLegacy",
				value: "|org-legacy-1|",
				comparison: "includes"
			});
		});

		it("returns 401 organizationIdNotFound when neither exact nor legacy match", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);
			vi.mocked(mockTenantStorage.query).mockResolvedValue({ entities: [] });

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: {}, query: { organization: "unknown-org" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.organizationIdNotFound" }),
				HttpStatusCode.unauthorized
			);
		});

		it("returns 401 missingOrganizationId when organization query param is absent", async () => {
			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: {}, query: {} } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingOrganizationId" }),
				HttpStatusCode.unauthorized
			);
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
		});
	});

	describe("skipAuth path", () => {
		it("resolves tenant from organization when skipAuth is true", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/some-endpoint", headers: {}, query: { organization: "org-A" } } as never,
				response,
				{ skipAuth: true } as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(contextIds[ContextIdKeys.Organization]).toBe("org-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
		});

		it("passes through silently when organization is absent and skipAuth is true", async () => {
			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/some-endpoint", headers: {}, query: {} } as never,
				response,
				{ skipAuth: true } as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
			expect(mockTenantStorage.get).not.toHaveBeenCalled();
			expect(mockTenantStorage.query).not.toHaveBeenCalled();
		});
	});

	describe("apiKeyEndpoints", () => {
		it("resolves tenant via organization on a non-api-key-endpoint URL", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: "/api/users", headers: {}, query: { organization: "org-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(mockTenantStorage.get).not.toHaveBeenCalledWith(expect.anything(), "apiKey");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
		});

		it("api-key wins on a login URL even when organization is also present", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				...TENANT_A,
				id: "tenant-from-key"
			});

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{
					url: LOGIN_URL,
					headers: { "x-api-key": "key-A" },
					query: { organization: "org-A" }
				} as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-key");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("key-A", "apiKey");
			expect(mockTenantStorage.get).not.toHaveBeenCalledWith("org-A", "organizationId");
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
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{
					url: "/login/callback",
					headers: {},
					query: { organization: "org-A" }
				} as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
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

		it("falls through to organization when URL does not match custom apiKeyEndpoints", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor({
				config: { apiKeyEndpoints: ["^/auth/token$"] }
			});
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{ url: LOGIN_URL, headers: {}, query: { organization: "org-A" } } as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
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

		it("does not use api-key path when query string contains /login but path does not end with it", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue(TENANT_A);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};

			await processor.pre(
				{
					url: "/api/users?redirect=/login",
					headers: {},
					query: { organization: "org-A" }
				} as never,
				response,
				{} as never,
				contextIds,
				{}
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-A");
			expect(mockTenantStorage.get).toHaveBeenCalledWith("org-A", "organizationId");
			expect(mockTenantStorage.get).not.toHaveBeenCalledWith(expect.anything(), "apiKey");
		});
	});
});
