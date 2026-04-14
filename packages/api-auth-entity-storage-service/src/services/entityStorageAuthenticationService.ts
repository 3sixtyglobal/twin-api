// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuthenticationRateActionConfig,
	IAuthenticationRateComponent,
	IAuthenticationAuditComponent,
	IAuthenticationAdminComponent,
	IAuthenticationComponent
} from "@twin.org/api-auth-entity-storage-models";
import { AuthAuditEvent } from "@twin.org/api-auth-entity-storage-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	Coerce,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	UnauthorizedError
} from "@twin.org/core";
import { PasswordGenerator, PasswordValidator } from "@twin.org/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import type { AuthenticationUser } from "../entities/authenticationUser.js";
import type { IEntityStorageAuthenticationServiceConstructorOptions } from "../models/IEntityStorageAuthenticationServiceConstructorOptions.js";
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
	 * Default maximum login attempts in a rate window.
	 * @internal
	 */
	private static readonly _DEFAULT_LOGIN_RATE_MAX_ATTEMPTS: number = 5;

	/**
	 * Default login rate window in minutes.
	 * @internal
	 */
	private static readonly _DEFAULT_LOGIN_RATE_WINDOW_MINUTES: number = 15;

	/**
	 * Default maximum password change attempts in a rate window.
	 * @internal
	 */
	private static readonly _DEFAULT_PASSWORD_CHANGE_RATE_MAX_ATTEMPTS: number = 5;

	/**
	 * Default password change rate window in minutes.
	 * @internal
	 */
	private static readonly _DEFAULT_PASSWORD_CHANGE_RATE_WINDOW_MINUTES: number = 15;

	/**
	 * Default maximum token refresh attempts in a rate window.
	 * @internal
	 */
	private static readonly _DEFAULT_TOKEN_REFRESH_RATE_MAX_ATTEMPTS: number = 30;

	/**
	 * Default token refresh rate window in minutes.
	 * @internal
	 */
	private static readonly _DEFAULT_TOKEN_REFRESH_RATE_WINDOW_MINUTES: number = 60;

	/**
	 * The user admin service.
	 * @internal
	 */
	private readonly _authenticationAdminService: IAuthenticationAdminComponent;

	/**
	 * The audit service.
	 * @internal
	 */
	private readonly _authenticationAuditService?: IAuthenticationAuditComponent;

	/**
	 * The rate service.
	 * @internal
	 */
	private readonly _authenticationRateService: IAuthenticationRateComponent;

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
	 * Rate limit configuration for login failures.
	 * @internal
	 */
	private readonly _loginRateLimit: IAuthenticationRateActionConfig;

	/**
	 * Rate limit configuration for password changes.
	 * @internal
	 */
	private readonly _passwordChangeRateLimit: IAuthenticationRateActionConfig;

	/**
	 * Rate limit configuration for token refresh.
	 * @internal
	 */
	private readonly _tokenRefreshRateLimit: IAuthenticationRateActionConfig;

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

		this._authenticationAuditService = ComponentFactory.getIfExists<IAuthenticationAuditComponent>(
			options?.authenticationAuditServiceType ?? "authentication-audit"
		);

		this._authenticationRateService = ComponentFactory.get<IAuthenticationRateComponent>(
			options?.authenticationRateServiceType ?? "authentication-rate"
		);

		this._signingKeyName = options?.config?.signingKeyName ?? "auth-signing";
		this._defaultTtlMinutes =
			options?.config?.defaultTtlMinutes ?? EntityStorageAuthenticationService._DEFAULT_TTL_MINUTES;
		this._loginRateLimit = {
			maxAttempts:
				options?.config?.loginRateLimit?.maxAttempts ??
				EntityStorageAuthenticationService._DEFAULT_LOGIN_RATE_MAX_ATTEMPTS,
			windowMinutes:
				options?.config?.loginRateLimit?.windowMinutes ??
				EntityStorageAuthenticationService._DEFAULT_LOGIN_RATE_WINDOW_MINUTES
		};
		this._passwordChangeRateLimit = {
			maxAttempts:
				options?.config?.passwordChangeRateLimit?.maxAttempts ??
				EntityStorageAuthenticationService._DEFAULT_PASSWORD_CHANGE_RATE_MAX_ATTEMPTS,
			windowMinutes:
				options?.config?.passwordChangeRateLimit?.windowMinutes ??
				EntityStorageAuthenticationService._DEFAULT_PASSWORD_CHANGE_RATE_WINDOW_MINUTES
		};
		this._tokenRefreshRateLimit = {
			maxAttempts:
				options?.config?.tokenRefreshRateLimit?.maxAttempts ??
				EntityStorageAuthenticationService._DEFAULT_TOKEN_REFRESH_RATE_MAX_ATTEMPTS,
			windowMinutes:
				options?.config?.tokenRefreshRateLimit?.windowMinutes ??
				EntityStorageAuthenticationService._DEFAULT_TOKEN_REFRESH_RATE_WINDOW_MINUTES
		};
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

		await this._authenticationRateService.registerAction("login", this._loginRateLimit);
		await this._authenticationRateService.registerAction(
			"password-change",
			this._passwordChangeRateLimit
		);
		await this._authenticationRateService.registerAction(
			"token-refresh",
			this._tokenRefreshRateLimit
		);
	}

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	public async stop(nodeLoggingComponentType?: string): Promise<void> {
		await this._authenticationRateService.unregisterAction("login");
		await this._authenticationRateService.unregisterAction("password-change");
		await this._authenticationRateService.unregisterAction("token-refresh");
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

		let loginUser: AuthenticationUser | undefined;
		let loginTenantId: string | undefined;
		let tokenAndExpiry: { token?: string; expiry: number } | undefined;

		try {
			await this._authenticationRateService.check("login", email);

			const user = await this._userEntityStorage.get(email);
			if (!user) {
				throw new GeneralError(EntityStorageAuthenticationService.CLASS_NAME, "userNotFound");
			}

			const saltBytes = Converter.base64ToBytes(user.salt);
			const passwordBytes = Converter.utf8ToBytes(password);

			const hashedPassword = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

			if (!PasswordValidator.comparePasswordHashes(hashedPassword, user.password)) {
				throw new GeneralError(EntityStorageAuthenticationService.CLASS_NAME, "passwordMismatch");
			}

			// This might be undefined if the login is performed in a single tenant context
			// if is verified during the token processing, tenant id will be matched against
			// the context
			const contextIds = await ContextIdStore.getContextIds();
			loginTenantId = contextIds?.[ContextIdKeys.Tenant];

			tokenAndExpiry = await TokenHelper.createToken(
				this._vaultConnector,
				`${this._nodeId}/${this._signingKeyName}`,
				user.identity,
				user.organization,
				loginTenantId,
				this._defaultTtlMinutes,
				user.scope
			);
			loginUser = user;
		} catch (error) {
			await this._authenticationAuditService?.create({
				actorId: email,
				event: AuthAuditEvent.LoginFailure
			});

			throw new UnauthorizedError(
				EntityStorageAuthenticationService.CLASS_NAME,
				"loginFailed",
				undefined,
				error
			);
		}

		await this._authenticationRateService.clear("login", email);

		await this._authenticationAuditService?.create({
			actorId: email,
			event: AuthAuditEvent.LoginSuccess,
			data: {
				userIdentity: loginUser.identity,
				organizationIdentity: loginUser.organization,
				tenantId: loginTenantId,
				scope: loginUser.scope.split(",")
			}
		});

		return tokenAndExpiry;
	}

	/**
	 * Logout the current user.
	 * @param token The token to logout, if it uses a mechanism with public access.
	 * @returns Nothing.
	 */
	public async logout(token?: string): Promise<void> {
		// Nothing to do here, as we are stateless.
		// The cookie will be revoked by the REST route handling
		const contextIds = await ContextIdStore.getContextIds();
		const identifier = contextIds?.[ContextIdKeys.User];
		if (Is.stringValue(identifier)) {
			await this._authenticationAuditService?.create({
				actorId: identifier,
				event: AuthAuditEvent.Logout
			});
		}
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
			token,
			undefined,
			async (userIdentity, organizationIdentity) => {
				const validParts = [];
				const user = await this._authenticationAdminService.getByIdentity(userIdentity);
				if (user?.userIdentity === userIdentity) {
					validParts.push("user");
				}
				if (user?.organizationIdentity === organizationIdentity) {
					validParts.push("organization");
				}
				return validParts;
			}
		);

		const refreshSub = headerAndPayload.payload.sub ?? "";
		await this._authenticationRateService.check("token-refresh", refreshSub);

		const refreshTokenAndExpiry = await TokenHelper.createToken(
			this._vaultConnector,
			`${this._nodeId}/${this._signingKeyName}`,
			refreshSub,
			Is.stringValue(headerAndPayload.payload.org) ? headerAndPayload.payload.org : "",
			Is.stringValue(headerAndPayload.payload.tid) ? headerAndPayload.payload.tid : "",
			this._defaultTtlMinutes,
			Coerce.string(headerAndPayload.payload?.scope)
		);
		const refreshScope = Coerce.string(headerAndPayload.payload?.scope) ?? "";

		await this._authenticationAuditService?.create({
			actorId: refreshSub,
			event: AuthAuditEvent.TokenRefreshed,
			data: {
				organizationIdentity: Is.stringValue(headerAndPayload.payload.org)
					? headerAndPayload.payload.org
					: "",
				tenantId: Is.stringValue(headerAndPayload.payload.tid) ? headerAndPayload.payload.tid : "",
				scope: refreshScope.split(",").filter(scope => scope.length > 0)
			}
		});

		return refreshTokenAndExpiry;
	}

	/**
	 * Update the user's password.
	 * @param currentPassword The current password for the user.
	 * @param newPassword The new password for the user.
	 * @returns Nothing.
	 */
	public async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.User);

		const userIdentity = contextIds[ContextIdKeys.User];
		await this._authenticationRateService.check("password-change", userIdentity);

		const user = await this._userEntityStorage.get(userIdentity);
		if (!Is.object<AuthenticationUser>(user)) {
			throw new NotFoundError(
				EntityStorageAuthenticationService.CLASS_NAME,
				"userNotFound",
				userIdentity
			);
		}

		await this._authenticationAdminService.updatePassword(user.email, newPassword, currentPassword);

		await this._authenticationRateService.clear("password-change", userIdentity);
	}
}
