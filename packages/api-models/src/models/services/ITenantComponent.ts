// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";

/**
 * Interface for the tenant component.
 */
export interface ITenantComponent extends IComponent {
	/**
	 * Run a per tenant operation.
	 * @param method The method to run for each tenant.
	 * @returns Nothing.
	 */
	runPerTenant(method: () => Promise<void>): Promise<void>;
}
