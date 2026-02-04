// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenant } from "@twin.org/api-models";
import type { HeaderTypes } from "@twin.org/web";

/**
 * The list of tenants.
 */
export interface ITenantListResponse {
	/**
	 * The headers which can be used to include the cursor.
	 */
	headers?: {
		[HeaderTypes.Link]?: string | string[];
	};

	/**
	 * The list of tenants.
	 */
	body: ITenant[];
}
