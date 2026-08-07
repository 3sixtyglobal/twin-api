// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the health service.
 */
export interface IHealthServiceConfig {
	/**
	 * The interval for checking the health of the components.
	 * @default 60000
	 */
	healthCheckInterval?: number;

	/**
	 * The interval for running the application health lifecycle (init, application, teardown).
	 * @default 300000
	 */
	healthCheckApplicationInterval?: number;

	/**
	 * The initial interval for checking the health of the components and setting it in the health service.
	 * This is used to check the health of the components immediately after the service is started.
	 * @default 2000
	 */
	initialInterval?: number;

	/**
	 * Whether to include stack traces in health check error details.
	 * @default false
	 */
	includeErrorStack?: boolean;
}
