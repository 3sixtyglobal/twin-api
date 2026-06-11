// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";

/**
 * Interface for the platform component.
 */
export interface IPlatformComponent extends IComponent {
	/**
	 * Indicates whether the component is running in a multi-tenant environment.
	 * @returns True if the component is running in a multi-tenant environment, false otherwise.
	 */
	isMultiTenant(): boolean;

	/**
	 * Execute a method, if single tenant will run once, if multi-tenant will run for each tenant.
	 * @param method The method to run for each tenant.
	 * @returns Nothing.
	 */
	execute(method: () => Promise<void>): Promise<void>;
}
