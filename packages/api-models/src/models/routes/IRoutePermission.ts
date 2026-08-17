// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Type which defines the authorization permission for a route.
 */
export type IRoutePermission = string | { permission: string; inherits?: string[] };
