// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuthenticationAdminComponent,
	IAuthenticationComponent
} from "@twin.org/api-auth-entity-storage-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	Coerce,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	UnauthorizedError
} from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import type { AuthenticationUser } from "../entities/authenticationUser.js";
import type { IEntityStorageAuthenticationServiceConstructorOptions } from "../models/IEntityStorageAuthenticationServiceConstructorOptions.js";
import { PasswordHelper } from "../utils/passwordHelper.js";
import { TokenHelper } from "../utils/tokenHelper.js";

/**
 * Implementation of the authentication component using entity storage.
 */
export class EntityStorageAuthenticationService implements IAuthenticationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntityStorageAuthenticationService>();

	/**
	 * Default TTL in minutes.
	 * @internal
	 */
	private static readonly _DEFAULT_TTL_MINUTES: number = 60;

	/**
	 * The user admin service.
	 * @internal
	 */
	private readonly _authenticationAdminService: IAuthenticationAdminComponent;

	/**
	 * The entity storage for users.
	 * @internal
	 */
	private readonly _userEntityStorage: IEntityStorageConnector<AuthenticationUser>;

	/**
	 * The vault for the keys.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The name of the key to retrieve from the vault for signing JWT.
	 * @internal
	 */
	private readonly _signingKeyName: string;

	/**
	 * The default TTL for the token.
	 * @internal
	 */
	private readonly _defaultTtlMinutes: number;

	/**
	 * The node identity.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of EntityStorageAuthentication.
	 * @param options The dependencies for the identity connector.
	 */
	constructor(options?: IEntityStorageAuthenticationServiceConstructorOptions) {
		this._userEntityStorage = EntityStorageConnectorFactory.get(
			options?.userEntityStorageType ?? "authentication-user"
		);

		this._vaultConnector = VaultConnectorFactory.get(options?.vaultConnectorType ?? "vault");

		this._authenticationAdminService = ComponentFactory.get<IAuthenticationAdminComponent>(
			options?.authenticationAdminServiceType ?? "authentication-admin"
		);

		this._signingKeyName = options?.config?.signingKeyName ?? "auth-signing";
		this._defaultTtlMinutes =
			options?.config?.defaultTtlMinutes ?? EntityStorageAuthenticationService._DEFAULT_TTL_MINUTES;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return EntityStorageAuthenticationService.CLASS_NAME;
	}

	/**
	 * The service needs to be started when the application is initialized.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Node);
		this._nodeId = contextIds[ContextIdKeys.Node];
	}

	/**
	 * Perform a login for the user.
	 * @param email The email address for the user.
	 * @param password The password for the user.
	 * @returns The authentication token for the user, if it uses a mechanism with public access.
	 */
	public async login(
		email: string,
		password: string
	): Promise<{
		token?: string;
		expiry: number;
	}> {
		Guards.stringValue(EntityStorageAuthenticationService.CLASS_NAME, nameof(email), email);
		Guards.stringValue(EntityStorageAuthenticationService.CLASS_NAME, nameof(password), password);

		try {
			const user = await this._userEntityStorage.get(email);
			if (!user) {
				throw new GeneralError(EntityStorageAuthenticationService.CLASS_NAME, "userNotFound");
			}

			const saltBytes = Converter.base64ToBytes(user.salt);
			const passwordBytes = Converter.utf8ToBytes(password);

			const hashedPassword = await PasswordHelper.hashPassword(passwordBytes, saltBytes);

			if (hashedPassword !== user.password) {
				throw new GeneralError(EntityStorageAuthenticationService.CLASS_NAME, "passwordMismatch");
			}

			// This might be undefined if the login is performed in a single tenant context
			// if is verified during the token processing, tenant id will be matched against
			// the context
			const contextIds = await ContextIdStore.getContextIds();
			const tenantId = contextIds?.[ContextIdKeys.Tenant];

			const tokenAndExpiry = await TokenHelper.createToken(
				this._vaultConnector,
				`${this._nodeId}/${this._signingKeyName}`,
				user.identity,
				user.organization,
				tenantId,
				this._defaultTtlMinutes,
				user.scope
			);

			return tokenAndExpiry;
		} catch (error) {
			throw new UnauthorizedError(
				EntityStorageAuthenticationService.CLASS_NAME,
				"loginFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Logout the current user.
	 * @param token The token to logout, if it uses a mechanism with public access.
	 * @returns Nothing.
	 */
	public async logout(token?: string): Promise<void> {
		// Nothing to do here.
	}

	/**
	 * Refresh the token.
	 * @param token The token to refresh, if it uses a mechanism with public access.
	 * @returns The refreshed token, if it uses a mechanism with public access.
	 */
	public async refresh(token?: string): Promise<{
		token?: string;
		expiry: number;
	}> {
		// If the verify fails on the current token then it will throw an exception.
		const headerAndPayload = await TokenHelper.verify(
			this._vaultConnector,
			`${this._nodeId}/${this._signingKeyName}`,
			token
		);

		const refreshTokenAndExpiry = await TokenHelper.createToken(
			this._vaultConnector,
			`${this._nodeId}/${this._signingKeyName}`,
			headerAndPayload.payload.sub ?? "",
			Is.stringValue(headerAndPayload.payload.org) ? headerAndPayload.payload.org : "",
			Is.stringValue(headerAndPayload.payload.tid) ? headerAndPayload.payload.tid : "",
			this._defaultTtlMinutes,
			Coerce.string(headerAndPayload.payload?.scope)
		);

		return refreshTokenAndExpiry;
	}

	/**
	 * Update the user's password.
	 * @param email The email address of the user to update.
	 * @param currentPassword The current password for the user.
	 * @param newPassword The new password for the user.
	 * @returns Nothing.
	 */
	public async updatePassword(
		email: string,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		return this._authenticationAdminService.updatePassword(email, newPassword, currentPassword);
	}
}
