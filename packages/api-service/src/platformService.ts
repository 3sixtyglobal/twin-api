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
	private readonly _entityStorageConnectorType: string;

	/**
	 * Entity storage connector used by the service.
	 * @internal
	 */
	private _entityStorageConnector?: IEntityStorageConnector<ITenant>;

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
		this._entityStorageConnectorType = options?.tenantEntityStorageType ?? "tenant";
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
	 * @param method The method to run for each tenant.
	 * @returns A promise that resolves when the method has been executed for all applicable tenants.
	 */
	public async execute(method: () => Promise<void>): Promise<void> {
		if (this._isMultiTenant) {
			if (Is.empty(this._entityStorageConnector)) {
				this._entityStorageConnector = EntityStorageConnectorFactory.get(
					this._entityStorageConnectorType
				);
			}

			let cursor: string | undefined;

			const baseContextIds = (await ContextIdStore.getContextIds()) ?? {};

			do {
				const result = await this._entityStorageConnector.query(
					undefined,
					undefined,
					["id"],
					cursor
				);

				for (const tenant of result.entities) {
					await ContextIdStore.run(
						{ ...baseContextIds, [ContextIdKeys.Tenant]: tenant.id },
						async () => {
							await method();
						}
					);
				}

				cursor = result.cursor;
			} while (Is.stringValue(cursor));
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
		const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];
		if (publicOrigin === origin) {
			return contextIds;
		}

		const localOrigin = contextIds?.[HttpContextIdKeys.LocalOrigin];
		if (localOrigin === origin) {
			return contextIds;
		}

		if (Is.empty(this._entityStorageConnector)) {
			this._entityStorageConnector = EntityStorageConnectorFactory.get(
				this._entityStorageConnectorType
			);
		}

		const tenant = await this._entityStorageConnector.get(origin, "publicOrigin");
		if (!Is.empty(tenant)) {
			return {
				...contextIds,
				[ContextIdKeys.Tenant]: tenant.id,
				[ContextIdKeys.Organization]: tenant.organizationId,
				[HttpContextIdKeys.PublicOrigin]: tenant.publicOrigin
			};
		}
	}
}
