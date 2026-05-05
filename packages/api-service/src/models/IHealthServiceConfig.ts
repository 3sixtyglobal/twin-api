// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the health service.
 */
export interface IHealthServiceConfig {
	/**
	 * The interval for checking the health of the components and setting it in the health service.
	 * @default 30000
	 */
	healthCheckInterval?: number;
}
