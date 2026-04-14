// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAuthenticationAdminComponent } from "@twin.org/api-auth-entity-storage-models";
import { HttpErrorHelper, type IHttpResponse } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { ComponentFactory, UnauthorizedError } from "@twin.org/core";
import type { IVaultConnector } from "@twin.org/vault-models";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { HttpStatusCode } from "@twin.org/web";
import { AuthHeaderProcessor } from "../../src/processors/authHeaderProcessor.js";
import { TokenHelper } from "../../src/utils/tokenHelper.js";

describe("AuthHeaderProcessor", () => {
	let mockAuthenticationAdminService: IAuthenticationAdminComponent;
	let mockVaultConnector: IVaultConnector;
	let processor: AuthHeaderProcessor;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockAuthenticationAdminService = {
			className: vi.fn().mockReturnValue("AuthenticationAdminService"),
			create: vi.fn(),
			update: vi.fn(),
			get: vi.fn(),
			getByIdentity: vi.fn(),
			remove: vi.fn(),
			updatePassword: vi.fn()
		};

		mockVaultConnector = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn()
		} as unknown as IVaultConnector;

		vi.spyOn(ComponentFactory, "get").mockReturnValue(mockAuthenticationAdminService);
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);

		processor = new AuthHeaderProcessor();
	});

	it("should populate context ids on successful verify", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockAuthenticationAdminService.getByIdentity).mockResolvedValue({
			email: "user@example.com",
			userIdentity: "did:user:123",
			organizationIdentity: "did:org:456",
			scope: ["user-admin"]
		});
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (_vault, _key, _token, _requiredScope, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456");
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
		expect(mockAuthenticationAdminService.getByIdentity).toHaveBeenCalledWith("did:user:123");
	});

	it("should return unauthorized response when verifyUser cannot confirm user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockAuthenticationAdminService.getByIdentity).mockRejectedValue(
			new Error("user not found")
		);
		vi.spyOn(TokenHelper, "extractTokenFromHeaders").mockReturnValue({
			token: "jwt",
			location: "authorization"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (_vault, _key, _token, _requiredScope, verifyUser) => {
				await verifyUser?.("did:user:123", "did:org:456");
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
});
