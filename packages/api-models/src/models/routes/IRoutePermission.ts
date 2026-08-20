// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Type which defines the default authorization permission for a route used to seed the RBAC rules.
 */
export type IRoutePermission = string | { permission: string; inherits?: string[] };
