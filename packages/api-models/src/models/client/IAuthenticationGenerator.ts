// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IHttpHeaders } from "@twin.org/web";

/**
 * Definition for the authentication generator component.
 */
export interface IAuthenticationGenerator extends IComponent {
	/**
	 * Adds authentication information to the request headers.
	 * @param requestHeaders The request headers to add authentication information to.
	 * @param authData Optional authentication data passed from the request.
	 * @returns A promise that resolves when the authentication information has been added.
	 */
	addAuthentication(requestHeaders: IHttpHeaders, authData?: unknown): Promise<void>;
}
