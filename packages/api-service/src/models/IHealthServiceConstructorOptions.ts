// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealthServiceConfig } from "./IHealthServiceConfig.js";

/**
 * Options for the HealthService constructor.
 */
export interface IHealthServiceConstructorOptions {
	/**
	 * The background task component type to use for running application health checks.
	 * @default background-task
	 */
	backgroundTaskComponentType?: string;

	/**
	 * The configuration for the service.
	 */
	config?: IHealthServiceConfig;
}
