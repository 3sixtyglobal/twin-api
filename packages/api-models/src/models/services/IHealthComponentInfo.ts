// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HealthStatus } from "./healthStatus.js";

/**
 * The health component information.
 */
export interface IHealthComponentInfo {
	/**
	 * The name of the component.
	 */
	name: string;

	/**
	 * The status of the component.
	 */
	status: HealthStatus;

	/**
	 * The details for the status.
	 */
	details?: string;
}
