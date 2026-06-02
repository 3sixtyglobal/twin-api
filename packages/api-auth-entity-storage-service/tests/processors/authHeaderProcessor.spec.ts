// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IHttpResponse,
	type IUrlTransformerComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { ComponentFactory, UnauthorizedError } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IVaultConnector } from "@twin.org/vault-models";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { HeaderTypes, HttpStatusCode } from "@twin.org/web";
import type { AuthenticationUser } from "../../src/entities/authenticationUser.js";
import { AuthHeaderProcessor } from "../../src/processors/authHeaderProcessor.js";
import { TokenHelper } from "../../src/utils/tokenHelper.js";

describe("AuthHeaderProcessor", () => {
	let mockUserEntityStorage: IEntityStorageConnector<AuthenticationUser>;
	let mockVaultConnector: IVaultConnector;
	let mockUrlTransformerComponent: IUrlTransformerComponent;
	let processor: AuthHeaderProcessor;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockUserEntityStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn(),
			remove: vi.fn(),
			query: vi.fn()
		} as unknown as IEntityStorageConnector<AuthenticationUser>;

		mockVaultConnector = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn()
		} as unknown as IVaultConnector;

		mockUrlTransformerComponent = {
			className: vi.fn(),
			encryptParam: vi.fn(),
			decryptParam: vi.fn(),
			getEncryptedQueryParam: vi.fn(),
			getEncryptedFromUrl: vi.fn(),
			addEncryptedQueryParamToUrl: vi.fn(),
			addEncryptedToUrl: vi.fn(),
			getDecryptedFromQueryParams: vi.fn(),
			encryptQueryParams: vi.fn(),
			decryptQueryParams: vi.fn(),
			getParamName: vi.fn()
		};

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockUserEntityStorage);
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);
		vi.spyOn(ComponentFactory, "get").mockImplementation(componentName => {
			if (componentName === "url-transformer") {
				return mockUrlTransformerComponent;
			}
			throw new Error(`Unexpected component ${componentName}`);
		});
		vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(undefined);

		processor = new AuthHeaderProcessor();
	});

	it("should populate context ids on successful verify", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 0
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				// No tid — single-tenant or tenant-free token; only user+org verified.
				const verified = await verifyUser?.("did:user:123", "did:org:456", undefined, 0);
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456" }
				};
			}
		);

		await processor.start();

		const contextIds: IContextIds = {};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
		expect(contextIds[ContextIdKeys.Organization]).toBe("did:org:456");
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
	});

	it("should set tenant context from token when tenantAdminComponent is configured", async () => {
		const mockTenantAdminComponent = {
			className: vi.fn(),
			get: vi.fn().mockResolvedValue({ id: "tenant-1", publicOrigin: "https://t1.example.com" })
		};
		vi.spyOn(ComponentFactory, "getIfExists").mockImplementation(componentName => {
			if (componentName === "tenant-admin") {
				return mockTenantAdminComponent;
			}
			return undefined;
		});
		processor = new AuthHeaderProcessor();

		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 0
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		const encryptedTenantId = "encrypted:tenant-1";
		vi.mocked(mockUrlTransformerComponent.decryptParam).mockResolvedValue("tenant-1");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456", encryptedTenantId, 0);
				expect(verified).toContain("tenant");
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: encryptedTenantId }
				};
			}
		);

		await processor.start();

		const contextIds: IContextIds = {};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-1");
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
	});

	it("should return unauthorized response when verifyUser cannot confirm user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockRejectedValue(new Error("user not found"));
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				await verifyUser?.("did:user:123", "did:org:456", undefined, undefined);
				throw new UnauthorizedError(TokenHelper.CLASS_NAME, "userNotVerified");
			}
		);
		const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");

		await processor.start();

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: "tenant-1"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(buildResponseSpy).toHaveBeenCalled();
		expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		expect(contextIds[ContextIdKeys.User]).toBeUndefined();
	});

	it("should return unauthorized when token passwordVersion is stale after a password change", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 1
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		const encryptedTenantId = "encrypted:tenant-1";
		vi.mocked(mockUrlTransformerComponent.decryptParam).mockResolvedValue("tenant-1");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				// pver=0 in token but user has passwordVersion=1 — simulate stale token
				const verified = await verifyUser?.("did:user:123", "did:org:456", encryptedTenantId, 0);
				if (!verified?.includes("user")) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "userNotVerified");
				}
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: encryptedTenantId }
				};
			}
		);
		const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");

		await processor.start();

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: "tenant-1"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(buildResponseSpy).toHaveBeenCalled();
		expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		expect(contextIds[ContextIdKeys.User]).toBeUndefined();
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
	});

	it("should succeed when token has no pver and user has no passwordVersion stored", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin"
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				// No tid — pver behaviour is the focus here.
				const verified = await verifyUser?.("did:user:123", "did:org:456", undefined, undefined);
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456" }
				};
			}
		);

		await processor.start();

		const contextIds: IContextIds = {};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
		expect(contextIds[ContextIdKeys.Organization]).toBe("did:org:456");
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
	});

	it("should return unauthorized when token has an encrypted tenant but tenantAdminComponent is not configured", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 0
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		const encryptedTenantId = "encrypted:tenant-1";
		vi.mocked(mockUrlTransformerComponent.decryptParam).mockResolvedValue("tenant-1");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456", encryptedTenantId, 0);
				if (!verified?.includes("tenant")) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "tenantNotVerified");
				}
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: encryptedTenantId }
				};
			}
		);
		const buildResponseSpy = vi.spyOn(HttpErrorHelper, "buildResponse");

		await processor.start();

		const contextIds: IContextIds = {};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(buildResponseSpy).toHaveBeenCalled();
		expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		expect(contextIds[ContextIdKeys.User]).toBeUndefined();
	});

	it("should overwrite existing context tenant with the one from the token", async () => {
		const mockTenantAdminComponent = {
			className: vi.fn(),
			get: vi.fn().mockResolvedValue({ id: "tenant-a", publicOrigin: "https://ta.example.com" })
		};
		vi.spyOn(ComponentFactory, "getIfExists").mockImplementation(componentName => {
			if (componentName === "tenant-admin") {
				return mockTenantAdminComponent;
			}
			return undefined;
		});
		processor = new AuthHeaderProcessor();

		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 0
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		const encryptedTenantA = "encrypted:tenant-a";
		vi.mocked(mockUrlTransformerComponent.decryptParam).mockResolvedValue("tenant-a");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456", encryptedTenantA, 0);
				expect(verified).toContain("tenant");
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: encryptedTenantA }
				};
			}
		);

		await processor.start();

		// Context had a different tenant — the token is the authoritative source.
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: "tenant-b"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe("tenant-a");
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
	});

	it("should succeed in single-tenant setup when neither context nor token has a tenant", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "hashed",
			salt: "salt",
			scope: "user-admin",
			passwordVersion: 0
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				// No tid in token — single-tenant system, no tenant verification required.
				const verified = await verifyUser?.("did:user:123", "did:org:456", undefined, 0);
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456" }
				};
			}
		);

		await processor.start();

		// No tenant in context — single-tenant system.
		const contextIds: IContextIds = {};
		const response: IHttpResponse = {};
		await processor.pre(
			{ headers: {} } as never,
			response,
			{ requiredScope: ["user-admin"] } as never,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
		expect(contextIds[ContextIdKeys.Organization]).toBe("did:org:456");
		expect(contextIds[ContextIdKeys.Tenant]).toBeUndefined();
	});

	it("should return the class name", () => {
		expect(processor.className()).toBe(AuthHeaderProcessor.CLASS_NAME);
	});

	describe("post", () => {
		it("should set a cookie on login when token arrived via cookie", async () => {
			const response: IHttpResponse = {};
			await processor.post(
				{ headers: {} } as never,
				response,
				{} as never,
				{},
				{ authOperation: "login", authToken: "new-jwt-token", authTokenLocation: "cookie" }
			);

			expect(response.headers?.[HeaderTypes.SetCookie]).toContain("new-jwt-token");
		});

		it("should set a cookie on refresh when token arrived via cookie", async () => {
			const response: IHttpResponse = {};
			await processor.post(
				{ headers: {} } as never,
				response,
				{} as never,
				{},
				{ authOperation: "refresh", authToken: "refreshed-jwt", authTokenLocation: "cookie" }
			);

			expect(response.headers?.[HeaderTypes.SetCookie]).toContain("refreshed-jwt");
		});

		it("should delete the cookie on logout when token arrived via cookie", async () => {
			const response: IHttpResponse = {};
			await processor.post(
				{ headers: {} } as never,
				response,
				{} as never,
				{},
				{ authOperation: "logout", authToken: "old-jwt", authTokenLocation: "cookie" }
			);

			expect(response.headers?.[HeaderTypes.SetCookie]).toContain("Max-Age=0");
		});

		it("should not set a cookie when the request came from an Authorization header", async () => {
			const response: IHttpResponse = {};
			await processor.post(
				{ headers: {} } as never,
				response,
				{} as never,
				{},
				{ authOperation: "login", authToken: "new-jwt-token", authTokenLocation: "authorization" }
			);

			expect(response.headers).toBeUndefined();
		});

		it("should not set a cookie when route is absent", async () => {
			const response: IHttpResponse = {};
			await processor.post(
				{ headers: {} } as never,
				response,
				undefined,
				{},
				{ authOperation: "login", authToken: "new-jwt-token", authTokenLocation: "cookie" }
			);

			expect(response.headers).toBeUndefined();
		});
	});
});
