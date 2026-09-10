// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpContextIdKeys,
	HttpUrlHelper,
	type IPlatformComponent,
	type ITenant
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { Guards, Is } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { IPlatformServiceConstructorOptions } from "./models/IPlatformServiceConstructorOptions.js";

/**
 * Service for performing platform operations.
 */
export class PlatformService implements IPlatformComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<PlatformService>();

	/**
	 * The type of entity storage connector to use for tenant lookups, if multi-tenant.
	 * @internal
	 */
	private readonly _tenantEntityStorageConnectorType: string;

	/**
	 * Entity storage connector used by the service.
	 * @internal
	 */
	private _tenantEntityStorageConnector?: IEntityStorageConnector<ITenant>;

	/**
	 * Indicates whether the service is running in a multi-tenant environment.
	 * @internal
	 */
	private readonly _isMultiTenant: boolean;

	/**
	 * Create a new instance of PlatformService.
	 * @param options The options for the connector.
	 */
	constructor(options?: IPlatformServiceConstructorOptions) {
		this._tenantEntityStorageConnectorType = options?.tenantEntityStorageType ?? "tenant";
		this._isMultiTenant = options?.config?.isMultiTenant ?? false;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return PlatformService.CLASS_NAME;
	}

	/**
	 * Indicates whether the component is running in a multi-tenant environment.
	 * @returns True if the component is running in a multi-tenant environment, false otherwise.
	 */
	public isMultiTenant(): boolean {
		return this._isMultiTenant;
	}

	/**
	 * Execute a method, if single tenant will run once, if multi-tenant will run for each tenant.
	 * @param method The method to run for each tenant, returning false will stop any further iterations.
	 * @returns A promise that resolves when the method has been executed for all applicable tenants.
	 */
	public async execute(method: () => Promise<undefined | boolean> | Promise<void>): Promise<void> {
		if (this._isMultiTenant) {
			const tenantEntityStorageConnector = this.ensureEntityStorageConnector();

			if (!Is.empty(tenantEntityStorageConnector)) {
				let cursor: string | undefined;
				let stopped = false;

				const baseContextIds = (await ContextIdStore.getContextIds()) ?? {};

				do {
					const result = await tenantEntityStorageConnector.query(
						undefined,
						undefined,
						["id"],
						cursor
					);

					for (const tenant of result.entities) {
						await ContextIdStore.run(
							{ ...baseContextIds, [ContextIdKeys.Tenant]: tenant.id },
							async () => {
								stopped = (await method()) === false;
							}
						);

						if (stopped) {
							break;
						}
					}

					cursor = result.cursor;
				} while (!stopped && Is.stringValue(cursor));
			}
		} else {
			await method();
		}
	}

	/**
	 * Get the local origin context IDs for the given URL.
	 * @param url The URL to check.
	 * @returns A promise that resolves to the context IDs if the URL is a local origin, undefined otherwise.
	 */
	public async getLocalOriginContext(url: string): Promise<IContextIds | undefined> {
		Guards.stringValue(PlatformService.CLASS_NAME, nameof(url), url);

		const origin = HttpUrlHelper.extractOrigin(url);
		if (!Is.stringValue(origin)) {
			return undefined;
		}

		const contextIds = await ContextIdStore.getContextIds();

		if (this._isMultiTenant) {
			const tenantEntityStorageConnector = this.ensureEntityStorageConnector();
			if (!Is.empty(tenantEntityStorageConnector)) {
				// Post-#203 organization routing: when the URL carries an ?organization=<org-did>
				// query param, that param - not the origin - identifies the target tenant. A single
				// node hosts many tenants behind one shared origin, so an origin match alone cannot
				// distinguish them and would incorrectly return the caller's own context. Resolve the
				// tenant by its organization id (mirrors TenantProcessor inbound routing); when the
				// organization is not a local tenant, treat the URL as remote (undefined).
				const organizationId = HttpUrlHelper.getQueryStringParam(url, ContextIdKeys.Organization);
				if (Is.stringValue(organizationId)) {
					const orgTenant = await tenantEntityStorageConnector.get(
						organizationId,
						"organizationId"
					);
					if (!Is.empty(orgTenant)) {
						return {
							...contextIds,
							[ContextIdKeys.Tenant]: orgTenant.id,
							[ContextIdKeys.Organization]: orgTenant.organizationId,
							[HttpContextIdKeys.PublicOrigin]: Is.stringValue(orgTenant.publicOrigin)
								? orgTenant.publicOrigin
								: contextIds?.[HttpContextIdKeys.PublicOrigin]
						};
					}
					return undefined;
				}
			}
		}

		const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];
		if (publicOrigin === origin) {
			return contextIds;
		}

		if (this._isMultiTenant) {
			const tenantEntityStorageConnector = this.ensureEntityStorageConnector();
			if (!Is.empty(tenantEntityStorageConnector)) {
				const tenant = await tenantEntityStorageConnector.get(origin, "publicOrigin");
				if (!Is.empty(tenant)) {
					return {
						...contextIds,
						[ContextIdKeys.Tenant]: tenant.id,
						[ContextIdKeys.Organization]: tenant.organizationId,
						[HttpContextIdKeys.PublicOrigin]: Is.stringValue(tenant.publicOrigin)
							? tenant.publicOrigin
							: contextIds?.[HttpContextIdKeys.PublicOrigin]
					};
				}
			}
		} else {
			const localOrigin = contextIds?.[HttpContextIdKeys.LocalOrigin];
			if (localOrigin === origin) {
				return contextIds;
			}
		}
	}

	/**
	 * Ensure that the entity storage connector is initialized and return it.
	 * @returns The entity storage connector.
	 * @internal
	 */
	private ensureEntityStorageConnector(): IEntityStorageConnector<ITenant> | undefined {
		if (Is.empty(this._tenantEntityStorageConnector)) {
			this._tenantEntityStorageConnector = EntityStorageConnectorFactory.getIfExists(
				this._tenantEntityStorageConnectorType
			);
		}

		return this._tenantEntityStorageConnector;
	}
}
