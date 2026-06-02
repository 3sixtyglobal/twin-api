// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHttpResponse,
	type IHttpServerRequest,
	type IUrlTransformerComponent
} from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import { BaseError, ComponentFactory, Is, UnauthorizedError } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "./entities/tenant.js";
import type { ITenantProcessorConstructorOptions } from "./models/ITenantProcessorConstructorOptions.js";

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
	 * The default endpoints to match for api key processing.
	 * @internal
	 */
	private static readonly _DEFAULT_API_KEY_ENDPOINTS: string[] = ["/login$"];

	/**
	 * The entity storage for api keys.
	 * @internal
	 */
	private readonly _entityStorageConnector: IEntityStorageConnector<Tenant>;

	/**
	 * The transformer component, used to resolve public origins for tenants and encrypt/decrypt tenant tokens.
	 * @internal
	 */
	private readonly _urlTransformerService: IUrlTransformerComponent;

	/**
	 * The key in the header to look for the api key.
	 * @internal
	 */
	private readonly _apiKeyName: string;

	/**
	 * The list of regexp patterns to match against the request URL to determine if the api key header should be processed.
	 * @internal
	 */
	private readonly _apiKeyEndpoints: RegExp[];

	/**
	 * Create a new instance of TenantProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: ITenantProcessorConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
		this._urlTransformerService = ComponentFactory.get(
			options?.urlTransformerComponentType ?? "url-transformer"
		);
		this._apiKeyName = options?.config?.apiKeyName ?? TenantProcessor.DEFAULT_API_KEY_NAME;
		this._apiKeyEndpoints = (
			options?.config?.apiKeyEndpoints ?? TenantProcessor._DEFAULT_API_KEY_ENDPOINTS
		).map((ep: string) => new RegExp(ep));
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return TenantProcessor.CLASS_NAME;
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
		if (!Is.empty(route) && !(route.skipTenant ?? false)) {
			try {
				let tenant;
				const isSkipAuth = route.skipAuth ?? false;
				const urlPath = new URL(request.url, "http://localhost").pathname;
				const isApiKeyEndpoint = this._apiKeyEndpoints.some(re => re.test(urlPath));

				if (isApiKeyEndpoint) {
					const apiKey = request.headers?.[this._apiKeyName] ?? request.query?.[this._apiKeyName];
					if (Is.stringValue(apiKey)) {
						tenant = await this.resolveByApiKey(apiKey);
					} else {
						throw new UnauthorizedError(TenantProcessor.CLASS_NAME, "missingApiKey", {
							keyName: this._apiKeyName
						});
					}
				} else {
					const tenantToken = await this._urlTransformerService.getEncryptedQueryParam(
						request.query,
						"tenant"
					);
					if (Is.stringValue(tenantToken)) {
						tenant = await this.resolveByTenantToken(tenantToken);
					} else if (isSkipAuth) {
						throw new UnauthorizedError(TenantProcessor.CLASS_NAME, "missingTenantToken", {
							paramName: this._urlTransformerService.getParamName("tenant")
						});
					}
				}

				if (!Is.empty(tenant)) {
					contextIds[ContextIdKeys.Tenant] = tenant.id;
					processorState.publicOrigin = tenant.publicOrigin;
				}
			} catch (err) {
				HttpErrorHelper.buildResponse(
					response,
					BaseError.fromError(err),
					HttpStatusCode.unauthorized
				);
			}
		}
	}

	/**
	 * Resolve the tenant context from an api key.
	 * @param apiKey The api key sent by the caller.
	 * @returns The tenant associated with the api key.
	 * @internal
	 */
	private async resolveByApiKey(apiKey: string): Promise<Tenant> {
		const nodeTenant = await this._entityStorageConnector.get(apiKey, "apiKey");

		if (Is.empty(nodeTenant)) {
			throw new UnauthorizedError(TenantProcessor.CLASS_NAME, "apiKeyNotFound", {
				key: apiKey
			});
		}

		return nodeTenant;
	}

	/**
	 * Resolve the tenant context from an encrypted tenant token query param.
	 * @param tenantId The encrypted tenant token.
	 * @returns The tenant associated with the tenant token.
	 * @internal
	 */
	private async resolveByTenantToken(tenantId: string): Promise<Tenant> {
		const nodeTenant = await this._entityStorageConnector.get(tenantId);

		if (Is.empty(nodeTenant)) {
			throw new UnauthorizedError(TenantProcessor.CLASS_NAME, "tenantNotFound", {
				tenantId
			});
		}

		return nodeTenant;
	}
}
