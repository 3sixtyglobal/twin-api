// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HealthStatus, IComponent, IHealth } from "@twin.org/core";

/**
 * The health component for the server.
 */
export interface IHealthComponent extends IComponent {
	/**
	 * Get the server health.
	 * @returns The service health.
	 */
	healthStatus(): Promise<{ status: HealthStatus; components: IHealth[] }>;
}
