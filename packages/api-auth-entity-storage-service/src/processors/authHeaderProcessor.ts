// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IUrlTransformerComponent,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHttpResponse,
	type IHttpServerRequest,
	type ITenantAdminComponent
} from "@twin.org/api-models";
import {
	ContextIdHelper,
	ContextIdKeys,
	ContextIdStore,
	type IContextIds
} from "@twin.org/context";
import { BaseError, Coerce, ComponentFactory, Is } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import { CookieHelper, HeaderTypes, HttpStatusCode } from "@twin.org/web";
import type { AuthenticationUser } from "../entities/authenticationUser.js";
import type { IAuthHeaderProcessorConstructorOptions } from "../models/IAuthHeaderProcessorConstructorOptions.js";
import { TokenHelper } from "../utils/tokenHelper.js";

/**
 * Handle a JWT token in the authorization header or cookies and validate it to populate request context identity.
 */
export class AuthHeaderProcessor implements IBaseRouteProcessor {
	/**
	 * The default name for the access token as a cookie.
	 * @internal
	 */
	public static readonly DEFAULT_COOKIE_NAME: string = "access_token";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<AuthHeaderProcessor>();

	/**
	 * The vault for the keys.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The transformer component, used to resolve public origins for tenants and encrypt/decrypt tenant tokens.
	 * @internal
	 */
	private readonly _urlTransformerService: IUrlTransformerComponent;

	/**
	 * The component to retrieve tenant information.
	 * @internal
	 */
	private readonly _tenantAdminComponent?: ITenantAdminComponent;

	/**
	 * The entity storage for users.
	 * @internal
	 */
	private readonly _userEntityStorage: IEntityStorageConnector<AuthenticationUser>;

	/**
	 * The name of the key to retrieve from the vault for signing JWT.
	 * @internal
	 */
	private readonly _signingKeyName: string;

	/**
	 * The name of the cookie to use for the token.
	 * @internal
	 */
	private readonly _cookieName: string;

	/**
	 * The node identity.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of AuthHeaderProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: IAuthHeaderProcessorConstructorOptions) {
		this._vaultConnector = VaultConnectorFactory.get(options?.vaultConnectorType ?? "vault");
		this._urlTransformerService = ComponentFactory.get(
			options?.urlTransformerComponentType ?? "url-transformer"
		);
		this._userEntityStorage = EntityStorageConnectorFactory.get(
			options?.userEntityStorageType ?? "authentication-user"
		);
		this._tenantAdminComponent = ComponentFactory.getIfExists<ITenantAdminComponent>(
			options?.tenantAdminComponentType ?? "tenant-admin"
		);

		this._signingKeyName = options?.config?.signingKeyName ?? "auth-signing";
		this._cookieName = options?.config?.cookieName ?? AuthHeaderProcessor.DEFAULT_COOKIE_NAME;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return AuthHeaderProcessor.CLASS_NAME;
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
	 * Pre process the REST request for the specified route.
	 * @param request The incoming request.
	 * @param response The outgoing response.
	 * @param route The route to process.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 */
	public async pre(
		request: IHttpServerRequest,
		response: IHttpResponse,
		route: IBaseRoute | undefined,
		contextIds: IContextIds,
		processorState: { [id: string]: unknown }
	): Promise<void> {
		if (!Is.empty(route) && !(route.skipAuth ?? false)) {
			try {
				const tokenAndLocation = TokenHelper.extractTokenFromHeaders(
					request.headers,
					this._cookieName
				);

				const headerAndPayload = await TokenHelper.verify(
					this._vaultConnector,
					`${this._nodeId}/${this._signingKeyName}`,
					tokenAndLocation?.token,
					route.requiredScope,
					async (
						userIdentity: string,
						organizationIdentity: string,
						encryptedTenantId: string | undefined,
						passwordVersion: number | undefined
					) => {
						const validParts = [];

						// If the token carries an encrypted tenant ID and the admin component is available,
						// decrypt and resolve the tenant first so the user lookup runs in the correct partition.
						if (Is.stringValue(encryptedTenantId)) {
							const tenantId = await this._urlTransformerService.decryptParam(encryptedTenantId);

							if (Is.stringValue(tenantId)) {
								const tenant = await this._tenantAdminComponent?.get(tenantId);
								if (!Is.empty(tenant)) {
									processorState.publicOrigin = tenant.publicOrigin;
									validParts.push("tenant");
									contextIds[ContextIdKeys.Tenant] = tenantId;
								}
							}
						}

						// Wrap the user lookup in the request context so partitioned storage uses the correct tenant.
						const user = await ContextIdStore.run(contextIds, async () =>
							this._userEntityStorage.get(userIdentity, "identity")
						);

						if (
							user?.identity === userIdentity &&
							(passwordVersion ?? 0) === (user.passwordVersion ?? 0)
						) {
							validParts.push("user");
						}
						if (user?.organization === organizationIdentity) {
							validParts.push("organization");
						}

						return validParts;
					}
				);

				contextIds[ContextIdKeys.User] = headerAndPayload.payload?.sub;
				contextIds[ContextIdKeys.Organization] = Coerce.string(headerAndPayload.payload?.org);

				processorState.authToken = tokenAndLocation?.token;
				processorState.authTokenLocation = tokenAndLocation?.location;
			} catch (err) {
				const error = BaseError.fromError(err);
				HttpErrorHelper.buildResponse(response, error, HttpStatusCode.unauthorized);
			}
		}
	}

	/**
	 * Post process the REST request for the specified route.
	 * @param request The incoming request.
	 * @param response The outgoing response.
	 * @param route The route to process.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 */
	public async post(
		request: IHttpServerRequest,
		response: IHttpResponse,
		route: IBaseRoute | undefined,
		contextIds: IContextIds,
		processorState: { [id: string]: unknown }
	): Promise<void> {
		const responseAuthOperation = processorState?.authOperation;
		const responseAuthToken = processorState?.authToken;

		// We don't populate the cookie if the incoming request was from an authorization header.
		if (
			!Is.empty(route) &&
			Is.stringValue(responseAuthOperation) &&
			processorState.authTokenLocation !== "authorization"
		) {
			if (
				(responseAuthOperation === "login" || responseAuthOperation === "refresh") &&
				Is.stringValue(responseAuthToken)
			) {
				response.headers ??= {};
				response.headers[HeaderTypes.SetCookie] = CookieHelper.createCookie(
					this._cookieName,
					responseAuthToken,
					{
						secure: true,
						httpOnly: true,
						sameSite: "None",
						path: "/"
					}
				);
			} else if (responseAuthOperation === "logout") {
				response.headers ??= {};
				response.headers[HeaderTypes.SetCookie] = CookieHelper.deleteCookie(this._cookieName, {
					secure: true,
					httpOnly: true,
					sameSite: "None",
					path: "/"
				});
			}
		}
	}
}
