// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealthServiceConfig } from "./IHealthServiceConfig.js";

/**
 * Options for the HealthService constructor.
 */
export interface IHealthServiceConstructorOptions {
	/**
	 * The configuration for the service.
	 */
	config?: IHealthServiceConfig;
}
