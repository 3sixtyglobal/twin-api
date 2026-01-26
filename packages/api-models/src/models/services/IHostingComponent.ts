// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";

/**
 * The information about the hosting of the API.
 */
export interface IHostingComponent extends IComponent {
	/**
	 * Get the public origin for the hosting.
	 * @param serverRequestUrl The url of the current server request if there is one.
	 * @returns The public origin.
	 */
	getPublicOrigin(serverRequestUrl?: string): Promise<string>;

	/**
	 * Get the public origin for the tenant if one exists.
	 * @param tenantId The tenant identifier.
	 * @returns The public origin for the tenant.
	 */
	getTenantOrigin(tenantId: string): Promise<string | undefined>;

	/**
	 * Build a public url based on the public origin and the url provided.
	 * @param url The url to build upon the public origin.
	 * @param serverRequestUrl The url of the current server request if there is one.
	 * @returns The full url based on the public origin.
	 */
	buildPublicUrl(url: string, serverRequestUrl?: string): Promise<string>;
}
