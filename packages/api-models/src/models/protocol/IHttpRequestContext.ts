// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpServerRequest } from "./IHttpServerRequest.js";

/**
 * Context data from the HTTP request.
 */
export interface IHttpRequestContext {
	/**
	 * The raw HTTP request.
	 */
	serverRequest: IHttpServerRequest;

	/**
	 * The state handed through the processors.
	 */
	processorState: { [id: string]: unknown };

	/**
	 * Logging component type for the request.
	 */
	loggingComponentType?: string;
}
