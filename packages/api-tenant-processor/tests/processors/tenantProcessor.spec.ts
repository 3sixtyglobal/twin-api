// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper, type IHostingComponent, type IHttpResponse } from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import { ComponentFactory } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "../../src/entities/tenant.js";
import { TenantProcessor } from "../../src/tenantProcessor.js";

describe("TenantProcessor", () => {
	let mockTenantStorage: IEntityStorageConnector<Tenant>;
	let mockHostingComponent: IHostingComponent;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn(),
			remove: vi.fn(),
			query: vi.fn()
		} as unknown as IEntityStorageConnector<Tenant>;

		mockHostingComponent = {
			className: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
			getPublicOrigin: vi.fn(),
			getTenantOrigin: vi.fn(),
			buildPublicUrl: vi.fn(),
			addTenantTokenToUrl: vi.fn(),
			getTenantTokenFromQueryParams: vi.fn().mockResolvedValue(undefined),
			encryptQueryParams: vi.fn(),
			decryptQueryParams: vi.fn(),
			encryptParam: vi.fn(),
			decryptParam: vi.fn()
		} as unknown as IHostingComponent;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockTenantStorage);
		vi.spyOn(ComponentFactory, "get").mockReturnValue(mockHostingComponent);
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

		it("should return 401 missingApiKeyOrTenantToken when neither header nor query carry a credential", async () => {
			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};

			await processor.pre({ headers: {} } as never, response, {} as never, {}, {});

			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingApiKeyOrTenantToken" }),
				HttpStatusCode.unauthorized
			);
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
		it("api-key wins when both api-key and tenant-token are present (precedence Q1)", async () => {
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				id: "tenant-from-key",
				apiKey: "key-A",
				publicOrigin: "https://key.example.com"
			} as Tenant);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{
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
			expect(mockHostingComponent.getTenantTokenFromQueryParams).not.toHaveBeenCalled();
			expect(mockTenantStorage.get).toHaveBeenCalledWith("key-A", "apiKey");
		});

		it("falls back to tenant-token when no api-key present", async () => {
			vi.mocked(mockHostingComponent.getTenantTokenFromQueryParams).mockResolvedValue(
				"tenant-from-token"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue({
				id: "tenant-from-token",
				apiKey: "key-T",
				publicOrigin: "https://token.example.com"
			} as Tenant);

			const processor = new TenantProcessor();
			const contextIds: IContextIds = {};
			const processorState: { [id: string]: unknown } = {};
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { "tenant-token": "opaque-token" } } as never,
				response,
				{} as never,
				contextIds,
				processorState
			);

			expect(response.statusCode).toBeUndefined();
			expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-from-token");
			expect(processorState.publicOrigin).toBe("https://token.example.com");
			expect(mockHostingComponent.getTenantTokenFromQueryParams).toHaveBeenCalledWith({
				"tenant-token": "opaque-token"
			});
			expect(mockTenantStorage.get).toHaveBeenCalledWith("tenant-from-token");
		});

		it("returns 401 tenantNotFound when hosting component resolves a token but the tenant is unknown", async () => {
			vi.mocked(mockHostingComponent.getTenantTokenFromQueryParams).mockResolvedValue(
				"unknown-tenant"
			);
			vi.mocked(mockTenantStorage.get).mockResolvedValue(undefined);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { "tenant-token": "valid-shape" } } as never,
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

		it("returns 401 missingApiKeyOrTenantToken when hosting component returns no tenant token", async () => {
			vi.mocked(mockHostingComponent.getTenantTokenFromQueryParams).mockResolvedValue(undefined);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { "tenant-token": "no-vault-configured" } } as never,
				response,
				{} as never,
				{},
				{}
			);

			expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
			expect(buildResponseSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ message: "tenantProcessor.missingApiKeyOrTenantToken" }),
				HttpStatusCode.unauthorized
			);
		});

		it("returns 401 when hosting component throws resolving tenant token", async () => {
			vi.mocked(mockHostingComponent.getTenantTokenFromQueryParams).mockRejectedValue(
				new Error("decryption failed")
			);

			const processor = new TenantProcessor();
			const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");
			const response: IHttpResponse = {};
			await processor.pre(
				{ headers: {}, query: { "tenant-token": "tampered" } } as never,
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
});
