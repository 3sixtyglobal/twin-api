// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IPlatformServiceConfig } from "./IPlatformServiceConfig.js";

/**
 * Options for the Platform Service constructor.
 */
export interface IPlatformServiceConstructorOptions {
	/**
	 * The entity storage for the tenants.
	 * @default tenant
	 */
	tenantEntityStorageType?: string;

	/**
	 * Configuration for the service.
	 */
	config?: IPlatformServiceConfig;
}
