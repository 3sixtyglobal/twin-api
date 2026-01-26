// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHttpResponse,
	type IHttpServerRequest
} from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import { BaseError, type IError, Is, UnauthorizedError } from "@twin.org/core";
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
	 * Create a new instance of NodeTenantProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: ITenantProcessorConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
		this._apiKeyName = options?.config?.apiKeyName ?? TenantProcessor.DEFAULT_API_KEY_NAME;
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
			const apiKey = request.headers?.[this._apiKeyName] ?? request.query?.[this._apiKeyName];
			let errorResponse: IError | undefined;

			if (Is.stringValue(apiKey)) {
				try {
					const nodeTenant = await this._entityStorageConnector.get(apiKey, "apiKey");

					if (Is.empty(nodeTenant)) {
						errorResponse = new UnauthorizedError(TenantProcessor.CLASS_NAME, "apiKeyNotFound", {
							key: apiKey
						});
					} else {
						contextIds[ContextIdKeys.Tenant] = nodeTenant.id;
						if (Is.stringValue(nodeTenant.publicOrigin)) {
							processorState.publicOrigin = nodeTenant.publicOrigin;
						}
					}
				} catch (err) {
					errorResponse = BaseError.fromError(err);
				}
			} else {
				errorResponse = new UnauthorizedError(TenantProcessor.CLASS_NAME, "missingApiKey", {
					keyName: this._apiKeyName
				});
			}

			if (!Is.empty(errorResponse)) {
				HttpErrorHelper.buildResponse(response, errorResponse, HttpStatusCode.unauthorized);
			}
		}
	}
}
