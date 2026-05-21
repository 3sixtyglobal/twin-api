// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuthenticationAuditComponent,
	IAuthenticationRateComponent
} from "@twin.org/api-auth-entity-storage-models";
import { TooManyRequestsError } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory, NotFoundError, UnauthorizedError } from "@twin.org/core";
import { PasswordGenerator, PasswordValidator } from "@twin.org/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import { EntityStorageAuthenticationService } from "../../src/services/entityStorageAuthenticationService.js";
import { PasswordHelper } from "../../src/utils/passwordHelper.js";
import { TokenHelper } from "../../src/utils/tokenHelper.js";

describe("EntityStorageAuthenticationService", () => {
	let mockAuthenticationAuditService: IAuthenticationAuditComponent;
	let mockAuthenticationRateService: IAuthenticationRateComponent;
	let mockUserEntityStorage: IEntityStorageConnector;
	let mockVaultConnector: IVaultConnector;
	let service: EntityStorageAuthenticationService;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockAuthenticationAuditService = {
			className: vi.fn().mockReturnValue("AuthenticationAuditService"),
			create: vi.fn(),
			query: vi.fn()
		};

		mockAuthenticationRateService = {
			className: vi.fn().mockReturnValue("AuthenticationRateService"),
			start: vi.fn(),
			stop: vi.fn(),
			registerAction: vi.fn(),
			unregisterAction: vi.fn(),
			check: vi.fn(),
			clear: vi.fn()
		};

		mockUserEntityStorage = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn()
		} as unknown as IEntityStorageConnector;

		mockVaultConnector = {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn()
		} as unknown as IVaultConnector;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockUserEntityStorage);
		vi.spyOn(VaultConnectorFactory, "get").mockReturnValue(mockVaultConnector);
		vi.spyOn(ComponentFactory, "get").mockImplementation(componentName => {
			if (componentName === "authentication-rate") {
				return mockAuthenticationRateService;
			}

			throw new Error(`Unexpected component ${componentName}`);
		});
		vi.spyOn(ComponentFactory, "getIfExists").mockImplementation(componentName => {
			if (componentName === "authentication-audit") {
				return mockAuthenticationAuditService;
			}

			return undefined;
		});

		service = new EntityStorageAuthenticationService();
	});

	it("should return the class name", () => {
		expect(service.className()).toBe(EntityStorageAuthenticationService.CLASS_NAME);
	});

	it("should login and create a token for a valid user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1",
			[ContextIdKeys.Tenant]: "tenant-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read,write"
		});
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("generated-password-hash");
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(true);
		vi.spyOn(TokenHelper, "createToken").mockResolvedValue({
			token: "jwt-token",
			expiry: 123456789
		});

		await service.start();
		const result = await service.login("user@example.com", "correct-password");

		expect(result).toEqual({ token: "jwt-token", expiry: 123456789 });
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("user@example.com");
		expect(TokenHelper.createToken).toHaveBeenCalledWith(
			mockVaultConnector,
			"node-1/auth-signing",
			"did:user:123",
			"did:org:456",
			"tenant-1",
			60,
			"read,write"
		);
		expect(mockAuthenticationRateService.clear).toHaveBeenCalledWith("login", "user@example.com");
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "login-success",
			data: {
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456",
				tenantId: "tenant-1",
				scope: ["read", "write"]
			}
		});
	});

	it("should throw UnauthorizedError when login password does not match", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read"
		});
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("generated-password-hash");
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(false);

		await service.start();

		await expect(service.login("user@example.com", "wrong-password")).rejects.toThrow(
			UnauthorizedError
		);
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "login-failure"
		});
	});

	it("should throw UnauthorizedError when login user does not exist", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue(undefined);
		const createTokenSpy = vi.spyOn(TokenHelper, "createToken");

		await service.start();

		await expect(service.login("missing@example.com", "password")).rejects.toThrow(
			UnauthorizedError
		);
		expect(createTokenSpy).not.toHaveBeenCalled();
	});

	it("should throw UnauthorizedError when token creation fails during login", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read"
		});
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("generated-password-hash");
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(true);
		vi.spyOn(TokenHelper, "createToken").mockRejectedValue(new Error("token generation failed"));

		await service.start();

		await expect(service.login("user@example.com", "correct-password")).rejects.toThrow(
			UnauthorizedError
		);
	});

	it("should register login rate action on start using defaults", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});

		await service.start();

		expect(mockAuthenticationRateService.registerAction).toHaveBeenCalledWith("login", {
			maxAttempts: 5,
			windowMinutes: 15
		});
		expect(mockAuthenticationRateService.registerAction).toHaveBeenCalledWith("password-change", {
			maxAttempts: 5,
			windowMinutes: 15
		});
		expect(mockAuthenticationRateService.registerAction).toHaveBeenCalledWith("token-refresh", {
			maxAttempts: 30,
			windowMinutes: 60
		});
	});

	it("should register login rate action on start when configured", async () => {
		service = new EntityStorageAuthenticationService({
			config: {
				loginRateLimit: {
					maxAttempts: 5,
					windowMinutes: 10
				}
			}
		});
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});

		await service.start();

		expect(mockAuthenticationRateService.registerAction).toHaveBeenCalledWith("login", {
			maxAttempts: 5,
			windowMinutes: 10
		});
	});

	it("should unregister login rate action on stop", async () => {
		await service.stop();

		expect(mockAuthenticationRateService.unregisterAction).toHaveBeenCalledWith("login");
		expect(mockAuthenticationRateService.unregisterAction).toHaveBeenCalledWith("password-change");
		expect(mockAuthenticationRateService.unregisterAction).toHaveBeenCalledWith("token-refresh");
	});

	it("should wrap rate limit check failures during login", async () => {
		service = new EntityStorageAuthenticationService({
			config: {
				loginRateLimit: {
					maxAttempts: 2,
					windowMinutes: 15
				}
			}
		});
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read"
		});
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("generated-password-hash");
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(false);
		vi.mocked(mockAuthenticationRateService.check).mockRejectedValue(
			new TooManyRequestsError(
				"EntityStorageAuthenticationRateService",
				"rateLimitExceeded",
				2,
				"2026-04-13T10:10:00.000Z"
			)
		);

		await service.start();
		const loginAttempt = service.login("user@example.com", "wrong-password");

		await expect(loginAttempt).rejects.toThrow(UnauthorizedError);
		await expect(loginAttempt).rejects.toMatchObject({
			cause: {
				name: TooManyRequestsError.name
			}
		});
		expect(mockAuthenticationRateService.check).toHaveBeenCalledWith("login", "user@example.com");
		expect(mockAuthenticationRateService.clear).not.toHaveBeenCalled();
	});

	it("should refresh a token after verifyUser confirms the stored user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read,write"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vaultConnector, signingKeyName, token, requiredScopes, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456");
				expect(verified).toEqual(["user", "organization"]);
				return {
					header: { alg: "EdDSA" },
					payload: {
						sub: "did:user:123",
						org: "did:org:456",
						tid: "tenant-1",
						scope: "read,write"
					}
				};
			}
		);
		vi.spyOn(TokenHelper, "createToken").mockResolvedValue({
			token: "refreshed-token",
			expiry: 987654321
		});

		await service.start();
		const result = await service.refresh("existing-token");

		expect(result).toEqual({ token: "refreshed-token", expiry: 987654321 });
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
		expect(TokenHelper.createToken).toHaveBeenCalledWith(
			mockVaultConnector,
			"node-1/auth-signing",
			"did:user:123",
			"did:org:456",
			"tenant-1",
			60,
			"read,write"
		);
		expect(mockAuthenticationRateService.check).toHaveBeenCalledWith(
			"token-refresh",
			"did:user:123"
		);
		expect(mockAuthenticationRateService.clear).not.toHaveBeenCalled();
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "did:user:123",
			event: "token-refreshed",
			data: {
				organizationIdentity: "did:org:456",
				tenantId: "tenant-1",
				scope: ["read", "write"]
			}
		});
	});

	it("should throw TooManyRequestsError when token refresh rate limit is exceeded", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vaultConnector, signingKeyName, token, requiredScopes, verifyUser) => {
				await verifyUser?.("did:user:123", "did:org:456");
				return {
					header: { alg: "EdDSA" },
					payload: {
						sub: "did:user:123",
						org: "did:org:456",
						tid: "tenant-1",
						scope: "read,write"
					}
				};
			}
		);
		vi.mocked(mockAuthenticationRateService.check).mockRejectedValue(
			new TooManyRequestsError(
				"EntityStorageAuthenticationRateService",
				"rateLimitExceeded",
				5,
				"2026-04-13T10:10:00.000Z"
			)
		);
		const createTokenSpy = vi.spyOn(TokenHelper, "createToken");

		await service.start();

		await expect(service.refresh("existing-token")).rejects.toThrow(TooManyRequestsError);
		expect(createTokenSpy).not.toHaveBeenCalled();
		expect(mockAuthenticationRateService.clear).not.toHaveBeenCalled();
	});

	it("should throw UnauthorizedError when refresh verification fails", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.spyOn(TokenHelper, "verify").mockRejectedValue(
			new UnauthorizedError(EntityStorageAuthenticationService.CLASS_NAME, "refreshFailed")
		);
		const createTokenSpy = vi.spyOn(TokenHelper, "createToken");

		await service.start();

		await expect(service.refresh("invalid-token")).rejects.toThrow(UnauthorizedError);
		expect(createTokenSpy).not.toHaveBeenCalled();
	});

	it("should throw UnauthorizedError when refresh verifyUser callback cannot confirm the user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:other",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read,write"
		});
		const createTokenSpy = vi.spyOn(TokenHelper, "createToken");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vaultConnector, signingKeyName, token, requiredScopes, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456");
				if (!verified?.includes("user")) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "userNotVerified");
				}

				return {
					header: { alg: "EdDSA" },
					payload: {
						sub: "did:user:123",
						org: "did:org:456"
					}
				};
			}
		);

		await service.start();

		await expect(service.refresh("existing-token")).rejects.toThrow(UnauthorizedError);
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
		expect(createTokenSpy).not.toHaveBeenCalled();
	});

	it("should throw UnauthorizedError when refresh verifyUser callback cannot confirm the organization", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.Node]: "node-1"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:other",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read,write"
		});
		const createTokenSpy = vi.spyOn(TokenHelper, "createToken");
		vi.spyOn(TokenHelper, "verify").mockImplementation(
			async (vaultConnector, signingKeyName, token, requiredScopes, verifyUser) => {
				const verified = await verifyUser?.("did:user:123", "did:org:456");
				if (!verified?.includes("organization")) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "organizationNotVerified");
				}

				return {
					header: { alg: "EdDSA" },
					payload: {
						sub: "did:user:123",
						org: "did:org:456"
					}
				};
			}
		);

		await service.start();

		await expect(service.refresh("existing-token")).rejects.toThrow(UnauthorizedError);
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
		expect(createTokenSpy).not.toHaveBeenCalled();
	});

	it("should update the password for the current user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.User]: "did:user:123"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue({
			email: "user@example.com",
			identity: "did:user:123",
			organization: "did:org:456",
			password: "stored-password-hash",
			salt: "c2FsdA==",
			scope: "read"
		});
		vi.spyOn(PasswordHelper, "updatePassword").mockResolvedValue(undefined);

		await service.updatePassword("current-password", "new-password");

		expect(mockAuthenticationRateService.check).toHaveBeenCalledWith(
			"password-change",
			"did:user:123"
		);
		expect(mockUserEntityStorage.get).toHaveBeenCalledWith("did:user:123", "identity");
		expect(PasswordHelper.updatePassword).toHaveBeenCalledWith(
			mockUserEntityStorage,
			mockAuthenticationAuditService,
			expect.objectContaining({ email: "user@example.com", identity: "did:user:123" }),
			"new-password",
			"current-password",
			undefined
		);
		expect(mockAuthenticationRateService.clear).toHaveBeenCalledWith(
			"password-change",
			"did:user:123"
		);
	});

	it("should throw TooManyRequestsError when password change rate limit is exceeded", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.User]: "did:user:123"
		});
		vi.mocked(mockAuthenticationRateService.check).mockRejectedValue(
			new TooManyRequestsError(
				"EntityStorageAuthenticationRateService",
				"rateLimitExceeded",
				2,
				"2026-04-13T10:10:00.000Z"
			)
		);

		await expect(service.updatePassword("current-password", "new-password")).rejects.toThrow(
			TooManyRequestsError
		);
		expect(mockUserEntityStorage.get).not.toHaveBeenCalled();
		expect(mockAuthenticationRateService.clear).not.toHaveBeenCalled();
	});

	it("should throw NotFoundError when updating the password for an unknown user", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.User]: "did:user:missing"
		});
		vi.mocked(mockUserEntityStorage.get).mockResolvedValue(undefined);

		await expect(service.updatePassword("current-password", "new-password")).rejects.toThrow(
			NotFoundError
		);
		expect(mockAuthenticationRateService.clear).not.toHaveBeenCalled();
	});

	it("should logout without throwing", async () => {
		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
			[ContextIdKeys.User]: "did:user:123"
		});

		await expect(service.logout("token")).resolves.toBeUndefined();
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "did:user:123",
			event: "logout"
		});
	});
});
