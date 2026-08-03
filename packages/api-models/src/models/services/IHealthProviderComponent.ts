// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IContextIds } from "@twin.org/context";
import type { IHealth } from "../IHealth.js";

/**
 * The health provider component for the server.
 */
export interface IHealthProviderComponent {
	/**
	 * Initialize the health processing for a component.
	 * @param lastTimestamp The Unix timestamp (ms) recorded at the start of the previous cycle.
	 * @param contextIds The context IDs provisioned during the init pass.
	 * @returns A promise that resolves when the initialization is complete.
	 */
	healthInit?(lastTimestamp: number, contextIds: IContextIds): Promise<void>;

	/**
	 * Returns the health status of the component, the context IDs from init are set in the current context.
	 * @param lastTimestamp The Unix timestamp (ms) recorded at the start of the previous cycle.
	 * @returns The health status of the component, can return multiple entries for elements within the component.
	 */
	health?(lastTimestamp: number): Promise<IHealth[]>;

	/**
	 * Teardown the health processing for a component.
	 * @param lastTimestamp The Unix timestamp (ms) recorded at the start of the previous cycle.
	 * @returns A promise that resolves when the teardown is complete.
	 */
	healthTeardown?(lastTimestamp: number): Promise<void>;
}
