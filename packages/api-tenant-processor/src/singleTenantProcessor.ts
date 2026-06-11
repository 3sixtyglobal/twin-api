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
import { BaseError, Is, UnauthorizedError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { HttpStatusCode } from "@twin.org/web";
import type { ISingleTenantProcessorConstructorOptions } from "./models/ISingleTenantProcessorConstructorOptions.js";

/**
 * Handles incoming api keys and maps them to tenant ids.
 */
export class SingleTenantProcessor implements IBaseRouteProcessor {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<SingleTenantProcessor>();

	/**
	 * The organization ID for the single-tenant node, cached at startup.
	 * @internal
	 */
	private _nodeOrganizationId?: string;

	/**
	 * Create a new instance of SingleTenantProcessor.
	 * @param options Options for the processor.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(options?: ISingleTenantProcessorConstructorOptions) {}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return SingleTenantProcessor.CLASS_NAME;
	}

	/**
	 * Cache the node organization ID from the engine context so it can be injected into each
	 * per-request context without requiring a separate ContextIdProcessor for Organization.
	 * @param nodeLoggingComponentType The node logging component type.
	 */
	public async start(nodeLoggingComponentType?: string): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);
		this._nodeOrganizationId = contextIds[ContextIdKeys.Organization];
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
		contextIds[ContextIdKeys.Organization] = this._nodeOrganizationId;

		if (!Is.empty(route)) {
			try {
				// If an organization ID is provided as a query parameter, validate it against the node organization ID.
				// since this processor is meant for single-tenant use cases, the presence of an organization ID is probably in the form
				// of a callback, so we should still validate it but not require it.
				const organizationIdQueryParam = request.query?.[ContextIdKeys.Organization];
				if (
					Is.stringValue(organizationIdQueryParam) &&
					organizationIdQueryParam !== this._nodeOrganizationId
				) {
					throw new UnauthorizedError(SingleTenantProcessor.CLASS_NAME, "invalidOrganizationId", {
						paramName: ContextIdKeys.Organization,
						value: organizationIdQueryParam
					});
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
}
