// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { TenantEventType } from "./tenantEventType.js";

/**
 * Callback invoked when a tenant event occurs.
 */
export type TenantEventCallback = (tenantId: string, eventType: TenantEventType) => Promise<void>;
