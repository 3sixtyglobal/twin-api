// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHostingServiceConfig } from "./IHostingServiceConfig.js";

/**
 * Options for the HostingService constructor.
 */
export interface IHostingServiceConstructorOptions {
	/**
	 * The tenant admin component type.
	 * @default tenant-admin
	 */
	tenantAdminComponentType?: string;

	/**
	 * The configuration for the service.
	 */
	config: IHostingServiceConfig;
}
