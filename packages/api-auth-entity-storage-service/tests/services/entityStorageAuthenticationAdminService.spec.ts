// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAuthenticationAuditComponent } from "@twin.org/api-auth-entity-storage-models";
import { ComponentFactory, GeneralError, RandomHelper } from "@twin.org/core";
import { PasswordGenerator, PasswordValidator } from "@twin.org/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { EntityStorageAuthenticationAdminService } from "../../src/services/entityStorageAuthenticationAdminService.js";

describe("EntityStorageAuthenticationAdminService", () => {
	let getMock: ReturnType<typeof vi.fn>;
	let setMock: ReturnType<typeof vi.fn>;
	let removeMock: ReturnType<typeof vi.fn>;
	let mockAuthenticationAuditService: IAuthenticationAuditComponent;
	let mockUserEntityStorage: IEntityStorageConnector;
	let service: EntityStorageAuthenticationAdminService;

	beforeEach(() => {
		vi.restoreAllMocks();

		getMock = vi.fn();
		setMock = vi.fn();
		removeMock = vi.fn();

		mockAuthenticationAuditService = {
			className: vi.fn().mockReturnValue("AuthenticationAuditService"),
			create: vi.fn(),
			query: vi.fn()
		};

		mockUserEntityStorage = {
			get: getMock,
			set: setMock,
			remove: removeMock
		} as unknown as IEntityStorageConnector;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockUserEntityStorage);
		vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockAuthenticationAuditService);

		service = new EntityStorageAuthenticationAdminService({
			config: {
				minPasswordLength: 10
			}
		});
	});

	it("should return the class name", () => {
		expect(service.className()).toBe(EntityStorageAuthenticationAdminService.CLASS_NAME);
	});

	it("should create a new user with normalised scopes", async () => {
		getMock.mockResolvedValue(undefined);
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});
		vi.spyOn(RandomHelper, "generate").mockReturnValue(new Uint8Array([1, 2, 3, 4]));
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("hashed-password");

		await service.create({
			email: "user@example.com",
			password: "correct-horse-battery",
			userIdentity: "did:user:123",
			organizationIdentity: "did:org:456",
			scope: [" Read ", "WRITE"]
		});

		expect(PasswordValidator.validatePassword).toHaveBeenCalledWith("correct-horse-battery", {
			minLength: 10
		});
		expect(setMock).toHaveBeenCalledWith({
			email: "user@example.com",
			salt: "AQIDBA==",
			password: "hashed-password",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "account-created",
			data: {
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456",
				scope: [" Read ", "WRITE"]
			}
		});
	});

	it("should wrap create failures when the user already exists", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read"
		});
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});

		await expect(
			service.create({
				email: "user@example.com",
				password: "correct-horse-battery",
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456",
				scope: ["read"]
			})
		).rejects.toThrow(GeneralError);
		expect(setMock).not.toHaveBeenCalled();
	});

	it("should wrap create failures when password validation fails", async () => {
		getMock.mockResolvedValue(undefined);
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {
			throw new Error("password too short");
		});

		await expect(
			service.create({
				email: "user@example.com",
				password: "short",
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456",
				scope: ["read"]
			})
		).rejects.toThrow(GeneralError);
		expect(setMock).not.toHaveBeenCalled();
	});

	it("should update an existing user and normalise scopes", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read"
		});

		await service.update({
			email: "user@example.com",
			organizationIdentity: "did:org:999",
			scope: [" Admin ", "WRITE"]
		});

		expect(setMock).toHaveBeenCalledWith({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:999",
			scope: "admin,write"
		});
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "account-updated",
			data: {
				updatedFields: ["organizationIdentity", "scope"],
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:999",
				scope: ["admin", "write"]
			}
		});
	});

	it("should wrap update failures when the user is missing", async () => {
		getMock.mockResolvedValue(undefined);

		await expect(
			service.update({
				email: "missing@example.com",
				userIdentity: "did:user:123"
			})
		).rejects.toThrow(GeneralError);
		expect(setMock).not.toHaveBeenCalled();
	});

	it("should get a user by email", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});

		const result = await service.get("user@example.com");

		expect(result).toEqual({
			email: "user@example.com",
			userIdentity: "did:user:123",
			organizationIdentity: "did:org:456",
			scope: ["read", "write"]
		});
	});

	it("should get a user by identity", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});

		const result = await service.getByIdentity("did:user:123");

		expect(getMock).toHaveBeenCalledWith("did:user:123", "identity");
		expect(result).toEqual({
			email: "user@example.com",
			userIdentity: "did:user:123",
			organizationIdentity: "did:org:456",
			scope: ["read", "write"]
		});
	});

	it("should wrap getByIdentity failures when the user is missing", async () => {
		getMock.mockResolvedValue(undefined);

		await expect(service.getByIdentity("did:user:missing")).rejects.toThrow(GeneralError);
	});

	it("should wrap get failures when the user is missing", async () => {
		getMock.mockResolvedValue(undefined);

		await expect(service.get("missing@example.com")).rejects.toThrow(GeneralError);
	});

	it("should remove an existing user", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read"
		});

		await service.remove("user@example.com");

		expect(removeMock).toHaveBeenCalledWith("user@example.com");
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "account-deleted",
			data: {
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456",
				scope: ["read"]
			}
		});
	});

	it("should wrap remove failures when the user is missing", async () => {
		getMock.mockResolvedValue(undefined);

		await expect(service.remove("missing@example.com")).rejects.toThrow(GeneralError);
		expect(removeMock).not.toHaveBeenCalled();
	});

	it("should update the password when the current password matches", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(true);
		vi.spyOn(RandomHelper, "generate").mockReturnValue(new Uint8Array([9, 8, 7, 6]));
		vi.spyOn(PasswordGenerator, "hashPassword")
			.mockResolvedValueOnce("current-password-hash")
			.mockResolvedValueOnce("new-password-hash");

		await service.updatePassword("user@example.com", "better-password-value", "current-password");

		expect(setMock).toHaveBeenCalledWith({
			email: "user@example.com",
			salt: "CQgHBg==",
			password: "new-password-hash",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
		expect(mockAuthenticationAuditService.create).toHaveBeenCalledWith({
			actorId: "user@example.com",
			event: "password-changed",
			data: {
				userIdentity: "did:user:123",
				organizationIdentity: "did:org:456"
			}
		});
	});

	it("should update the password without checking the current password when none is provided", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});
		const comparePasswordHashesSpy = vi.spyOn(PasswordValidator, "comparePasswordHashes");
		vi.spyOn(RandomHelper, "generate").mockReturnValue(new Uint8Array([5, 6, 7, 8]));
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("new-password-hash");

		await service.updatePassword("user@example.com", "better-password-value");

		expect(comparePasswordHashesSpy).not.toHaveBeenCalled();
		expect(setMock).toHaveBeenCalledWith({
			email: "user@example.com",
			salt: "BQYHCA==",
			password: "new-password-hash",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
	});

	it("should wrap updatePassword failures when the current password does not match", async () => {
		getMock.mockResolvedValue({
			email: "user@example.com",
			password: "stored-password",
			salt: "AQIDBA==",
			identity: "did:user:123",
			organization: "did:org:456",
			scope: "read,write"
		});
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});
		vi.spyOn(PasswordGenerator, "hashPassword").mockResolvedValue("current-password-hash");
		vi.spyOn(PasswordValidator, "comparePasswordHashes").mockReturnValue(false);

		await expect(
			service.updatePassword("user@example.com", "better-password-value", "wrong-current-password")
		).rejects.toThrow(GeneralError);
		expect(setMock).not.toHaveBeenCalled();
	});

	it("should wrap updatePassword failures when the user is missing", async () => {
		getMock.mockResolvedValue(undefined);
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {});

		await expect(
			service.updatePassword("missing@example.com", "better-password-value")
		).rejects.toThrow(GeneralError);
		expect(setMock).not.toHaveBeenCalled();
	});

	it("should wrap updatePassword failures when new password validation fails", async () => {
		vi.spyOn(PasswordValidator, "validatePassword").mockImplementation(() => {
			throw new Error("password too short");
		});

		await expect(service.updatePassword("user@example.com", "short")).rejects.toThrow(GeneralError);
		expect(getMock).toHaveBeenCalledWith("user@example.com");
		expect(setMock).not.toHaveBeenCalled();
	});
});
