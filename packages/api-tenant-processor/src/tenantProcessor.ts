// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHttpResponse,
	type IHttpServerRequest
} from "@twin.org/api-models";
import {
	ContextIdHelper,
	ContextIdKeys,
	ContextIdStore,
	type IContextIds
} from "@twin.org/context";
import { BaseError, type IError, Is, UnauthorizedError } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { type IVaultConnector, VaultConnectorFactory } from "@twin.org/vault-models";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "./entities/tenant.js";
import type { ITenantProcessorConstructorOptions } from "./models/ITenantProcessorConstructorOptions.js";
import { TenantUrlHelper } from "./utils/tenantUrlHelper.js";

/**
 * Handles incoming api keys and maps them to tenant ids.
 */
export class TenantProcessor implements IBaseRouteProcessor {
	/**
	 * The default name for the api key header.
	 * @internal
	 */
	public static readonly DEFAULT_API_KEY_NAME: string = "x-api-key";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantProcessor>();

	/**
	 * The entity storage for api keys.
	 * @internal
	 */
	private readonly _entityStorageConnector: IEntityStorageConnector<Tenant>;

	/**
	 * The key in the header to look for the api key.
	 * @internal
	 */
	private readonly _apiKeyName: string;

	/**
	 * The query param name carrying the encrypted tenant token.
	 * @internal
	 */
	private readonly _tenantTokenName: string;

	/**
	 * The vault connector used to decrypt tenant tokens.
	 * Only set when `signingKeyName` is configured.
	 * @internal
	 */
	private readonly _vaultConnector?: IVaultConnector;

	/**
	 * The name of the symmetric key in the vault used to decrypt tenant tokens.
	 * @internal
	 */
	private readonly _signingKeyName?: string;

	/**
	 * The node identity, captured at start.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of NodeTenantProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: ITenantProcessorConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
		this._apiKeyName = options?.config?.apiKeyName ?? TenantProcessor.DEFAULT_API_KEY_NAME;
		this._tenantTokenName =
			options?.config?.tenantTokenName ?? TenantUrlHelper.DEFAULT_TENANT_TOKEN_NAME;

		// Vault is resolved only when a connector type is explicitly passed, following
		if (Is.stringValue(options?.vaultConnectorType)) {
			this._vaultConnector = VaultConnectorFactory.get(options.vaultConnectorType);
		}
		if (Is.stringValue(options?.config?.signingKeyName)) {
			this._signingKeyName = options.config.signingKeyName;
		}
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return TenantProcessor.CLASS_NAME;
	}

	/**
	 * The processor needs to be started when the application is initialized so that
	 * the node identity is available for vault key resolution. Only required when
	 * the encrypted-token path is wired (i.e. `signingKeyName` is configured).
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		if (Is.empty(this._vaultConnector) || Is.empty(this._signingKeyName)) {
			return;
		}
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
		const tenantToken = request.query?.[this._tenantTokenName];
		const tokenDecodable =
			Is.stringValue(tenantToken) &&
			!Is.empty(this._vaultConnector) &&
			Is.stringValue(this._signingKeyName);

		// skipTenant routes (cross-node trust JWT routes) bypass api-key resolution
		// accept an encrypted ?tenantToken= query param so cross-tenant catalogue/DSP/PNP routing reaches the publisher's tenant context
		if (Is.empty(route) || (route.skipTenant ?? false)) {
			if (tokenDecodable) {
				const errorResponse = await this.resolveByTenantToken(
					tenantToken,
					contextIds,
					processorState
				);
				if (!Is.empty(errorResponse)) {
					HttpErrorHelper.buildResponse(response, errorResponse, HttpStatusCode.unauthorized);
				}
			}
			return;
		}

		const apiKey = request.headers?.[this._apiKeyName] ?? request.query?.[this._apiKeyName];
		let errorResponse: IError | undefined;

		if (Is.stringValue(apiKey)) {
			errorResponse = await this.resolveByApiKey(apiKey, contextIds, processorState);
		} else if (tokenDecodable) {
			errorResponse = await this.resolveByTenantToken(tenantToken, contextIds, processorState);
		} else {
			errorResponse = new UnauthorizedError(TenantProcessor.CLASS_NAME, "missingApiKey", {
				keyName: this._apiKeyName
			});
		}

		if (!Is.empty(errorResponse)) {
			HttpErrorHelper.buildResponse(response, errorResponse, HttpStatusCode.unauthorized);
		}
	}

	/**
	 * Resolve the tenant context from an api key.
	 * @param apiKey The api key sent by the caller.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 * @returns An error to surface, or undefined on success.
	 * @internal
	 */
	private async resolveByApiKey(
		apiKey: string,
		contextIds: IContextIds,
		processorState: { [id: string]: unknown }
	): Promise<IError | undefined> {
		try {
			const nodeTenant = await this._entityStorageConnector.get(apiKey, "apiKey");

			if (Is.empty(nodeTenant)) {
				return new UnauthorizedError(TenantProcessor.CLASS_NAME, "apiKeyNotFound", {
					key: apiKey
				});
			}

			contextIds[ContextIdKeys.Tenant] = nodeTenant.id;
			if (Is.stringValue(nodeTenant.publicOrigin)) {
				processorState.publicOrigin = nodeTenant.publicOrigin;
			}
		} catch (err) {
			return BaseError.fromError(err);
		}
	}

	/**
	 * Resolve the tenant context from an encrypted tenant token query param.
	 * @param tenantToken The encrypted tenant token.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 * @returns An error to surface, or undefined on success.
	 * @internal
	 */
	private async resolveByTenantToken(
		tenantToken: string,
		contextIds: IContextIds,
		processorState: { [id: string]: unknown }
	): Promise<IError | undefined> {
		let tenantId: string;
		try {
			tenantId = await TenantUrlHelper.decrypt(
				tenantToken,
				this._vaultConnector as IVaultConnector,
				`${this._nodeId}/${this._signingKeyName}`
			);
		} catch {
			return new UnauthorizedError(TenantProcessor.CLASS_NAME, "tenantTokenInvalid", {
				token: tenantToken
			});
		}

		try {
			const nodeTenant = await this._entityStorageConnector.get(tenantId);

			if (Is.empty(nodeTenant)) {
				return new UnauthorizedError(TenantProcessor.CLASS_NAME, "tenantTokenNotFound", {
					tenantId
				});
			}

			contextIds[ContextIdKeys.Tenant] = nodeTenant.id;
			if (Is.stringValue(nodeTenant.publicOrigin)) {
				processorState.publicOrigin = nodeTenant.publicOrigin;
			}
		} catch (err) {
			return BaseError.fromError(err);
		}
	}
}
