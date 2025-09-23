// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IHttpRequestIdentity } from "../protocol/IHttpRequestIdentity";
import type { IHttpResponse } from "../protocol/IHttpResponse";
import type { IHttpServerRequest } from "../protocol/IHttpServerRequest";
import type { IBaseRoute } from "../routes/IBaseRoute";

/**
 * The definition for a base processor for handling REST routes.
 */
export interface IBaseRouteProcessor<T = IBaseRoute, R = IHttpServerRequest> extends IComponent {
	/**
	 * Features supported by this processor.
	 * If a route has any of these features listed, this processor will be run for that route.
	 * If this is not implemented, the processor will run for all routes.
	 * @returns The features supported by this processor.
	 */
	features?(): string[];

	/**
	 * Pre process the REST request for the specified route.
	 * @param request The request to handle.
	 * @param response The response data to send if any.
	 * @param route The route being requested, if a matching one was found.
	 * @param requestIdentity The identity context for the request.
	 * @param processorState The state handed through the processors.
	 * @param loggingComponentType The logging component type for the request.
	 * @returns Promise that resolves when the request is processed.
	 */
	pre?(
		request: R,
		response: IHttpResponse,
		route: T | undefined,
		requestIdentity: IHttpRequestIdentity,
		processorState: { [id: string]: unknown },
		loggingComponentType?: string
	): Promise<void>;

	/**
	 * Post process the REST request for the specified route.
	 * @param request The request to handle.
	 * @param response The response data to send if any.
	 * @param route The route being requested, if a matching one was found.
	 * @param requestIdentity The identity context for the request.
	 * @param processorState The state handed through the processors.
	 * @param loggingComponentType The logging component type for the request.
	 * @returns Promise that resolves when the request is processed.
	 */
	post?(
		request: R,
		response: IHttpResponse,
		route: T | undefined,
		requestIdentity: IHttpRequestIdentity,
		processorState: { [id: string]: unknown },
		loggingComponentType?: string
	): Promise<void>;
}
