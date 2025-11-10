// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IBaseRoute } from "./IBaseRoute.js";
import type { IHttpRequest } from "../protocol/IHttpRequest.js";
import type { IHttpResponse } from "../protocol/IHttpResponse.js";
import type { ISocketRequestContext } from "../protocol/ISocketRequestContext.js";

/**
 * Interface which defines a socket route.
 */
export interface ISocketRoute<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends IHttpRequest = any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	U extends IHttpResponse = any
> extends IBaseRoute {
	/**
	 * The handler module.
	 */
	handler: (
		/**
		 * The request context.
		 */
		socketRequestContext: ISocketRequestContext,

		/**
		 * The request object.
		 */
		request: T,

		/**
		 * The function to emit an event.
		 */
		emit: (event: string, response: U) => Promise<void>
	) => void;

	/**
	 * The connected handler.
	 */
	connected?: (
		/**
		 * The request context.
		 */
		socketRequestContext: ISocketRequestContext
	) => void;

	/**
	 * The disconnected handler.
	 */
	disconnected?: (
		/**
		 * The request context.
		 */
		socketRequestContext: ISocketRequestContext
	) => void;
}
