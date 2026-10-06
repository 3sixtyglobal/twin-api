// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantAdminServiceConfig } from "./ITenantAdminServiceConfig.js";

/**
 * Options for the Tenant Admin Service constructor.
 */
export interface ITenantAdminServiceConstructorOptions {
	/**
	 * The entity storage for the tenants.
	 * @default tenant
	 */
	tenantEntityStorageType?: string;

	/**
	 * The component type to use for firing tenant events.
	 * @default platform
	 */
	platformComponentType?: string;

	/**
	 * Configuration for the service.
	 */
	config?: ITenantAdminServiceConfig;
}
