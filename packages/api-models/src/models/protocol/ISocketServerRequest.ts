// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpServerRequest } from "./IHttpServerRequest.js";

/**
 * Model for the standard parameters for an http request.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ISocketServerRequest<T = any> extends IHttpServerRequest<T> {
	/**
	 * The socket id.
	 */
	socketId: string;
}
