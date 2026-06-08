// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Is } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { Tenant } from "./entities/tenant.js";
import type { ITenantAdminServiceConstructorOptions } from "./models/ITenantAdminServiceConstructorOptions.js";

/**
 * Service for performing tenant administration operations.
 */
export class TenantService implements ITenantComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantService>();

	/**
	 * Entity storage connector used by the service.
	 * @internal
	 */
	private readonly _entityStorageConnector: IEntityStorageConnector<Tenant>;

	/**
	 * Create a new instance of TenantService.
	 * @param options The options for the connector.
	 */
	constructor(options?: ITenantAdminServiceConstructorOptions) {
		this._entityStorageConnector = EntityStorageConnectorFactory.get(
			options?.tenantEntityStorageType ?? "tenant"
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return TenantService.CLASS_NAME;
	}

	/**
	 * Run a per tenant operation.
	 * @param method The method to run for each tenant.
	 * @returns Nothing.
	 */
	public async runPerTenant(method: () => Promise<void>): Promise<void> {
		let cursor: string | undefined;

		const baseContextIds = (await ContextIdStore.getContextIds()) ?? {};

		do {
			const result = await this._entityStorageConnector.query(undefined, undefined, ["id"], cursor);

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
	}
}
