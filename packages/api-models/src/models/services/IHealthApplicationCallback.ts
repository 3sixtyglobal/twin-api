// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHealth } from "../IHealth.js";

/**
 * Callback invoked by a component to supply a deferred application health result.
 * Only called when healthApplication returns undefined.
 */
export type HealthApplicationCallback = (result: IHealth[]) => Promise<void>;
