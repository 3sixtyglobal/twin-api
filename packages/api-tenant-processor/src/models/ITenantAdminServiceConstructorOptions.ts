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
	 * Configuration for the admin service.
	 */
	config?: ITenantAdminServiceConfig;
}
