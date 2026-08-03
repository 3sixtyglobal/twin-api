// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The category of a health check.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HealthCategory = {
	/**
	 * Connectivity health check for infrastructure connectors.
	 */
	Connectivity: "connectivity",

	/**
	 * Application health check for domain services.
	 */
	Application: "application"
} as const;

/**
 * The category of a health check.
 */
export type HealthCategory = (typeof HealthCategory)[keyof typeof HealthCategory];
