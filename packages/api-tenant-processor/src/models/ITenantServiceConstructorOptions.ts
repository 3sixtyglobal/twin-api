// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantServiceConfig } from "./ITenantServiceConfig.js";

/**
 * Options for the Tenant Service constructor.
 */
export interface ITenantServiceConstructorOptions {
	/**
	 * The entity storage for the tenants.
	 * @default tenant
	 */
	tenantEntityStorageType?: string;

	/**
	 * Configuration for the service.
	 */
	config?: ITenantServiceConfig;
}
