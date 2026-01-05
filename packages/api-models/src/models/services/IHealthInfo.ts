// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HealthStatus } from "./healthStatus.js";
import type { IHealthComponentInfo } from "./IHealthComponentInfo.js";

/**
 * The status of the server.
 */
export interface IHealthInfo {
	/**
	 * The status.
	 */
	status: HealthStatus;

	/**
	 * The status of the components.
	 */
	components?: IHealthComponentInfo[];
}
