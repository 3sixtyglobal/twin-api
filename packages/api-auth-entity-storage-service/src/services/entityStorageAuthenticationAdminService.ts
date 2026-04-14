// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuthenticationAuditComponent,
	IAuthenticationAdminComponent,
	IAuthenticationUser
} from "@twin.org/api-auth-entity-storage-models";
import { AuthAuditEvent } from "@twin.org/api-auth-entity-storage-models";
import {
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	RandomHelper
} from "@twin.org/core";
import { PasswordGenerator, PasswordValidator } from "@twin.org/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { AuthenticationUser } from "../entities/authenticationUser.js";
import type { IEntityStorageAuthenticationAdminServiceConstructorOptions } from "../models/IEntityStorageAuthenticationAdminServiceConstructorOptions.js";

/**
 * Implementation of the authentication component using entity storage.
 */
export class EntityStorageAuthenticationAdminService implements IAuthenticationAdminComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntityStorageAuthenticationAdminService>();

	/**
	 * The entity storage for users.
	 * @internal
	 */
	private readonly _userEntityStorage: IEntityStorageConnector<AuthenticationUser>;

	/**
	 * The audit service.
	 * @internal
	 */
	private readonly _authenticationAuditService?: IAuthenticationAuditComponent;

	/**
	 * The minimum password length.
	 * @internal
	 */
	private readonly _minPasswordLength?: number;

	/**
	 * Create a new instance of EntityStorageAuthentication.
	 * @param options The dependencies for the identity connector.
	 */
	constructor(options?: IEntityStorageAuthenticationAdminServiceConstructorOptions) {
		this._userEntityStorage = EntityStorageConnectorFactory.get(
			options?.userEntityStorageType ?? "authentication-user"
		);

		this._authenticationAuditService = ComponentFactory.getIfExists<IAuthenticationAuditComponent>(
			options?.authenticationAuditServiceType ?? "authentication-audit"
		);

		this._minPasswordLength = options?.config?.minPasswordLength;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return EntityStorageAuthenticationAdminService.CLASS_NAME;
	}

	/**
	 * Create a login for the user.
	 * @param user The user to create.
	 * @returns Nothing.
	 */
	public async create(user: Omit<IAuthenticationUser, "salt">): Promise<void> {
		Guards.object<IAuthenticationUser>(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user),
			user
		);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.email),
			user.email
		);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.password),
			user.password
		);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.userIdentity),
			user.userIdentity
		);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.organizationIdentity),
			user.organizationIdentity
		);
		Guards.array<string>(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.scope),
			user.scope
		);

		try {
			PasswordValidator.validatePassword(user.password, {
				minLength: this._minPasswordLength
			});

			const existingUser = await this._userEntityStorage.get(user.email);
			if (Is.object<AuthenticationUser>(existingUser)) {
				throw new GeneralError(EntityStorageAuthenticationAdminService.CLASS_NAME, "userExists");
			}

			const saltBytes = RandomHelper.generate(16);
			const passwordBytes = Converter.utf8ToBytes(user.password);

			const hashedPassword = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

			const newUser: AuthenticationUser = {
				email: user.email,
				salt: Converter.bytesToBase64(saltBytes),
				password: hashedPassword,
				identity: user.userIdentity,
				organization: user.organizationIdentity,
				scope: user.scope.map(s => s.trim().toLocaleLowerCase()).join(",")
			};

			await this._userEntityStorage.set(newUser);
			await this._authenticationAuditService?.create({
				actorId: user.email,
				event: AuthAuditEvent.AccountCreated,
				data: {
					userIdentity: user.userIdentity,
					organizationIdentity: user.organizationIdentity,
					scope: user.scope
				}
			});
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"createUserFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Update a login for the user.
	 * @param user The user to update.
	 * @returns Nothing.
	 */
	public async update(
		user: Partial<Omit<IAuthenticationUser, "password" | "salt">>
	): Promise<void> {
		Guards.object<IAuthenticationUser>(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user),
			user
		);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(user.email),
			user.email
		);

		if (!Is.empty(user.userIdentity)) {
			Guards.stringValue(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				nameof(user.userIdentity),
				user.userIdentity
			);
		}
		if (!Is.empty(user.organizationIdentity)) {
			Guards.stringValue(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				nameof(user.organizationIdentity),
				user.organizationIdentity
			);
		}
		if (!Is.empty(user.scope)) {
			Guards.array<string>(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				nameof(user.scope),
				user.scope
			);
		}

		try {
			const existingUser = await this._userEntityStorage.get(user.email);
			if (!Is.object<AuthenticationUser>(existingUser)) {
				throw new NotFoundError(
					EntityStorageAuthenticationAdminService.CLASS_NAME,
					"userNotFound",
					user.email
				);
			}

			const updatedFields: string[] = [];
			const updatedScope = Is.array(user.scope)
				? user.scope.map(s => s.trim().toLocaleLowerCase()).join(",")
				: existingUser.scope;

			if (user.userIdentity !== undefined && user.userIdentity !== existingUser.identity) {
				updatedFields.push("userIdentity");
			}
			if (
				user.organizationIdentity !== undefined &&
				user.organizationIdentity !== existingUser.organization
			) {
				updatedFields.push("organizationIdentity");
			}
			if (Is.array(user.scope) && updatedScope !== existingUser.scope) {
				updatedFields.push("scope");
			}

			existingUser.identity = user.userIdentity ?? existingUser.identity;
			existingUser.organization = user.organizationIdentity ?? existingUser.organization;
			existingUser.scope = Is.array(user.scope) ? updatedScope : existingUser.scope;

			await this._userEntityStorage.set(existingUser);
			await this._authenticationAuditService?.create({
				actorId: existingUser.email,
				event: AuthAuditEvent.AccountUpdated,
				data: {
					updatedFields,
					userIdentity: existingUser.identity,
					organizationIdentity: existingUser.organization,
					scope: existingUser.scope.split(",")
				}
			});
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"updateUserFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get a user by email.
	 * @param email The email address of the user to get.
	 * @returns The user details.
	 */
	public async get(email: string): Promise<Omit<IAuthenticationUser, "password" | "salt">> {
		Guards.stringValue(EntityStorageAuthenticationAdminService.CLASS_NAME, nameof(email), email);

		try {
			const user = await this._userEntityStorage.get(email);
			if (!Is.object<AuthenticationUser>(user)) {
				throw new NotFoundError(
					EntityStorageAuthenticationAdminService.CLASS_NAME,
					"userNotFound",
					email
				);
			}

			return {
				email: user.email,
				userIdentity: user.identity,
				organizationIdentity: user.organization,
				scope: user.scope.split(",")
			};
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"getUserFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get a user by identity.
	 * @param identity The identity of the user to get.
	 * @returns The user details.
	 */
	public async getByIdentity(
		identity: string
	): Promise<Omit<IAuthenticationUser, "password" | "salt">> {
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(identity),
			identity
		);

		try {
			const user = await this._userEntityStorage.get(identity, "identity");
			if (!Is.object<AuthenticationUser>(user)) {
				throw new NotFoundError(
					EntityStorageAuthenticationAdminService.CLASS_NAME,
					"userNotFound",
					identity
				);
			}

			return {
				email: user.email,
				userIdentity: user.identity,
				organizationIdentity: user.organization,
				scope: user.scope.split(",")
			};
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"getUserFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Remove the current user.
	 * @param email The email address of the user to remove.
	 * @returns Nothing.
	 */
	public async remove(email: string): Promise<void> {
		Guards.stringValue(EntityStorageAuthenticationAdminService.CLASS_NAME, nameof(email), email);

		try {
			const user = await this._userEntityStorage.get(email);
			if (!Is.object<AuthenticationUser>(user)) {
				throw new NotFoundError(
					EntityStorageAuthenticationAdminService.CLASS_NAME,
					"userNotFound",
					email
				);
			}

			await this._userEntityStorage.remove(email);
			await this._authenticationAuditService?.create({
				actorId: email,
				event: AuthAuditEvent.AccountDeleted,
				data: {
					userIdentity: user.identity,
					organizationIdentity: user.organization,
					scope: user.scope.split(",")
				}
			});
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"removeUserFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Update the user's password.
	 * @param email The email address of the user to update.
	 * @param newPassword The new password for the user.
	 * @param currentPassword The current password, optional, if supplied will check against existing.
	 * @returns Nothing.
	 */
	public async updatePassword(
		email: string,
		newPassword: string,
		currentPassword?: string
	): Promise<void> {
		Guards.stringValue(EntityStorageAuthenticationAdminService.CLASS_NAME, nameof(email), email);
		Guards.stringValue(
			EntityStorageAuthenticationAdminService.CLASS_NAME,
			nameof(newPassword),
			newPassword
		);

		try {
			PasswordValidator.validatePassword(newPassword, {
				minLength: this._minPasswordLength
			});

			const user = await this._userEntityStorage.get(email);
			if (!Is.object<AuthenticationUser>(user)) {
				throw new NotFoundError(
					EntityStorageAuthenticationAdminService.CLASS_NAME,
					"userNotFound",
					email
				);
			}

			if (Is.stringValue(currentPassword)) {
				const saltBytes = Converter.base64ToBytes(user.salt);
				const passwordBytes = Converter.utf8ToBytes(currentPassword);

				const hashedPassword = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

				if (!PasswordValidator.comparePasswordHashes(hashedPassword, user.password)) {
					throw new GeneralError(
						EntityStorageAuthenticationAdminService.CLASS_NAME,
						"currentPasswordMismatch"
					);
				}
			}

			const saltBytes = RandomHelper.generate(16);
			const passwordBytes = Converter.utf8ToBytes(newPassword);

			const hashedPassword = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

			const updatedUser: AuthenticationUser = {
				email,
				salt: Converter.bytesToBase64(saltBytes),
				password: hashedPassword,
				identity: user.identity,
				organization: user.organization,
				scope: user.scope
			};

			await this._userEntityStorage.set(updatedUser);
			await this._authenticationAuditService?.create({
				actorId: email,
				event: AuthAuditEvent.PasswordChanged,
				data: {
					userIdentity: updatedUser.identity,
					organizationIdentity: updatedUser.organization
				}
			});
		} catch (error) {
			throw new GeneralError(
				EntityStorageAuthenticationAdminService.CLASS_NAME,
				"updatePasswordFailed",
				undefined,
				error
			);
		}
	}
}
