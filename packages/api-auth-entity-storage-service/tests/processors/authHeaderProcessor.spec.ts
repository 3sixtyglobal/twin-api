// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper, type IHttpResponse } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { UnauthorizedError } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IVaultConnector } from "@twin.org/vault-models";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { HttpStatusCode } from "@twin.org/web";
import type { AuthenticationUser } from "../../src/entities/authenticationUser.js";
import { AuthHeaderProcessor } from "../../src/processors/authHeaderProcessor.js";
import { TokenHelper } from "../../src/utils/tokenHelper.js";

describe("AuthHeaderProcessor", () => {
	let mockUserEntityStorage: IEntityStorageConnector<AuthenticationUser>;
	let mockVaultConnector: IVaultConnector;
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

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockUserEntityStorage);
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);

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
				const verified = await verifyUser?.("did:user:123", "did:org:456", 0);
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: {
						sub: "did:user:123",
						org: "did:org:456",
						tid: "tenant-1"
					}
				};
			}
		);

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

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
		expect(contextIds[ContextIdKeys.Organization]).toBe("did:org:456");
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
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
				await verifyUser?.("did:user:123", "did:org:456", undefined);
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
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vault, key, token, requiredScope, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456", 0);
				if (!verified?.includes("user")) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "userNotVerified");
				}
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: "tenant-1" }
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
				const verified = await verifyUser?.("did:user:123", "did:org:456", undefined);
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: { sub: "did:user:123", org: "did:org:456", tid: "tenant-1" }
				};
			}
		);

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

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.User]).toBe("did:user:123");
		expect(contextIds[ContextIdKeys.Organization]).toBe("did:org:456");
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
	});
});
