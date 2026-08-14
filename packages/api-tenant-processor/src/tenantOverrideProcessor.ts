// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	ForbiddenError,
	HttpContextIdKeys,
	HttpErrorHelper,
	ScopeHelper,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHttpResponse,
	type IHttpServerRequest
} from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import { BaseError, Is, NotFoundError } from "@twin.org/core";
import type { IEntityStorageConnector } from "@twin.org/entity-storage-models";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { Tenant } from "./entities/tenant.js";
import type { ITenantOverrideProcessorConstructorOptions } from "./models/ITenantOverrideProcessorConstructorOptions.js";

/**
 * Processes the overrideTenant query parameter for routes that allow tenant override.
 * Requires the caller to hold the escalated privilege scope. Runs after AuthHeaderProcessor so
 * authentication is always resolved in the caller's own partition first.
 */
export class TenantOverrideProcessor implements IBaseRouteProcessor {
	/**
	 * The query parameter name used to supply the override tenant ID.
	 */
	public static readonly OVERRIDE_TENANT_PARAM: string = "override-tenant";

	/**
	 * The scope string required to perform a tenant override.
	 */
	public static readonly DEFAULT_ESCALATED_PRIVILEGE_SCOPE: string = "global-admin";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantOverrideProcessor>();

	/**
	 * The entity storage for api keys.
	 * @internal
	 */
	private readonly _entityStorageConnector: IEntityStorageConnector<Tenant>;

	/**
	 * Include the stack with errors.
	 * @internal
	 */
	private readonly _includeErrorStack: boolean;

	/**
	 * The scope value that grants cross-tenant access.
	 * @internal
	 */
	private readonly _escalatedPrivilegeScope: string;

	/**
	 * Create a new instance of TenantOverrideProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: ITenantOverrideProcessorConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
		this._includeErrorStack = options?.config?.includeErrorStack ?? false;
		this._escalatedPrivilegeScope =
			options?.config?.escalatedPrivilegeScope ??
			TenantOverrideProcessor.DEFAULT_ESCALATED_PRIVILEGE_SCOPE;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return TenantOverrideProcessor.CLASS_NAME;
	}

	/**
	 * Pre process the REST request for the specified route.
	 * @param request The incoming request.
	 * @param response The outgoing response.
	 * @param route The route to process.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 * @returns A promise that resolves when the tenant override has been applied or skipped.
	 */
	public async pre(
		request: IHttpServerRequest,
		response: IHttpResponse,
		route: IBaseRoute | undefined,
		contextIds: IContextIds,
		processorState: { [id: string]: unknown }
	): Promise<void> {
		if (Is.empty(route) || (route.disableTenantOverride ?? false)) {
			return;
		}

		const overrideTenantParam = request.query?.[TenantOverrideProcessor.OVERRIDE_TENANT_PARAM];
		if (!Is.stringValue(overrideTenantParam)) {
			return;
		}

		// If a prior processor already set an error response, skip processing.
		if (Is.notEmpty(response.statusCode)) {
			return;
		}

		try {
			// Caller must hold the escalated privilege scope.
			if (
				!ScopeHelper.includes(contextIds[HttpContextIdKeys.Scope], this._escalatedPrivilegeScope)
			) {
				throw new ForbiddenError(
					TenantOverrideProcessor.CLASS_NAME,
					"insufficientScopeForTenantOverride"
				);
			}

			// Verify the tenant exists before substituting.
			const tenant = await this._entityStorageConnector.get(overrideTenantParam);
			if (tenant?.id !== overrideTenantParam) {
				throw new NotFoundError(
					TenantOverrideProcessor.CLASS_NAME,
					"tenantNotFound",
					overrideTenantParam
				);
			}

			contextIds[HttpContextIdKeys.OriginalTenant] = contextIds[ContextIdKeys.Tenant];
			contextIds[ContextIdKeys.Tenant] = overrideTenantParam;
		} catch (err) {
			const error = BaseError.fromError(err);
			const { httpStatusCode } = HttpErrorHelper.processError(error);
			HttpErrorHelper.buildResponse(response, error, httpStatusCode, this._includeErrorStack);
		}
	}
}
