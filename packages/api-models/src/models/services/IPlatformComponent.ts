// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IContextIds } from "@3sixty/context";
import type { IComponent } from "@3sixty/core";

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
	 * @param method The method to run for each tenant, returning false will stop any further iterations.
	 * @returns A promise that resolves when the method has been executed for all applicable tenants.
	 */
	execute(method: () => Promise<undefined | boolean> | Promise<void>): Promise<void>;

	/**
	 * Get the local origin context IDs for the given URL.
	 * @param url The URL to check.
	 * @returns A promise that resolves to the context IDs if the URL is a local origin, undefined otherwise.
	 */
	getLocalOriginContext(url: string): Promise<IContextIds | undefined>;
}
