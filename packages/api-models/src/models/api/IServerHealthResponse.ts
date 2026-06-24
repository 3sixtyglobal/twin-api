// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HealthStatus, IHealth } from "@twin.org/core";

/**
 * The health of the server.
 */
export interface IServerHealthResponse {
	/**
	 * The health for the server.
	 */
	body: { status: HealthStatus; components: IHealth[] };
}
