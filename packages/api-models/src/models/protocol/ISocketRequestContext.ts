// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRequestContext } from "./IHttpRequestContext";

/**
 * Context data from the socket request.
 */
export interface ISocketRequestContext extends IHttpRequestContext {
	/**
	 * The id of the socket.
	 */
	socketId: string;
}
