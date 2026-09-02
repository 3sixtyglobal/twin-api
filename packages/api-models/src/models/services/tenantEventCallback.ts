// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { TenantEventType } from "./tenantEventType.js";

/**
 * Callback invoked when a tenant event occurs.
 * Failures in the callback will be logged but will not prevent other callbacks from being invoked.
 */
export type TenantEventCallback = (tenantId: string, eventType: TenantEventType) => Promise<void>;
