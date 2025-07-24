// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpErrorHelper,
	type IHttpRequest,
	type IHttpRequestIdentity,
	type IHttpResponse,
	type ISocketRequestContext,
	type ISocketRoute,
	type ISocketRouteProcessor,
	type ISocketServerRequest
} from "@twin.org/api-models";
import { Is, NotFoundError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { HttpStatusCode } from "@twin.org/web";
import type { ISocketRouteProcessorConstructorOptions } from "../models/ISocketRouteProcessorConstructorOptions";

/**
 * Process the socket request and hands it on to the route handler.
 */
export class SocketRouteProcessor implements ISocketRouteProcessor {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<SocketRouteProcessor>();

	/**
	 * Include the stack with errors.
	 * @internal
	 */
	private readonly _includeErrorStack: boolean;

	/**
	 * Create a new instance of SocketRouteProcessor.
	 * @param options Options for the processor.
	 */
	constructor(options?: ISocketRouteProcessorConstructorOptions) {
		this._includeErrorStack = options?.config?.includeErrorStack ?? false;
	}

	/**
	 * Process the connected event.
	 * @param request The server request object containing the socket id and other parameters.
	 * @param route The route being requested, if a matching one was found.
	 * @returns Promise that resolves when the request is processed.
	 */
	public async connected(
		request: ISocketServerRequest,
		route: ISocketRoute | undefined
	): Promise<void> {
		if (route?.connected) {
			try {
				const req: IHttpRequest = {
					pathParams: request.pathParams,
					query: request.query,
					body: request.body
				};

				const socketRequestContext: ISocketRequestContext = {
					socketId: request.socketId,
					serverRequest: req,
					processorState: {}
				};

				await route.connected(socketRequestContext);
			} catch {}
		}
	}

	/**
	 * Process the disconnected event.
	 * @param request The server request object containing the socket id and other parameters.
	 * @param route The route being requested, if a matching one was found.
	 * @returns Promise that resolves when the request is processed.
	 */
	public async disconnected(
		request: ISocketServerRequest,
		route: ISocketRoute | undefined
	): Promise<void> {
		if (route?.disconnected) {
			try {
				const req: IHttpRequest = {
					pathParams: request.pathParams,
					query: request.query,
					body: request.body
				};

				const socketRequestContext: ISocketRequestContext = {
					socketId: request.socketId,
					serverRequest: req,
					processorState: {}
				};

				await route.disconnected(socketRequestContext);
			} catch {}
		}
	}

	/**
	 * Process the REST request for the specified route.
	 * @param request The incoming request.
	 * @param response The outgoing response.
	 * @param route The route to process.
	 * @param requestIdentity The identity context for the request.
	 * @param processorState The state handed through the processors.
	 * @param responseEmitter The function to emit a response.
	 */
	public async process(
		request: ISocketServerRequest,
		response: IHttpResponse,
		route: ISocketRoute | undefined,
		requestIdentity: IHttpRequestIdentity,
		processorState: { [id: string]: unknown },
		responseEmitter: (topic: string, response: IHttpResponse) => Promise<void>
	): Promise<void> {
		// Don't handle the route if another processor has already set the response
		// status code e.g. from an auth processor
		if (Is.empty(response.statusCode)) {
			if (Is.empty(route)) {
				HttpErrorHelper.buildResponse(
					response,
					{
						name: NotFoundError.CLASS_NAME,
						message: `${this.CLASS_NAME}.routeNotFound`,
						properties: {
							notFoundId: request.url
						}
					},
					HttpStatusCode.notFound
				);
			} else {
				try {
					const req: IHttpRequest = {
						pathParams: request.pathParams,
						query: request.query,
						body: request.body
					};

					const socketRequestContext: ISocketRequestContext = {
						...requestIdentity,
						socketId: request.socketId,
						serverRequest: request,
						processorState
					};

					await route.handler(socketRequestContext, req, async (topic, restRouteResponse) => {
						response.headers = restRouteResponse?.headers;
						response.body = restRouteResponse?.body;
						response.statusCode =
							restRouteResponse.statusCode ?? response.statusCode ?? HttpStatusCode.ok;
						await responseEmitter(topic, response);
					});
				} catch (err) {
					const { error, httpStatusCode } = HttpErrorHelper.processError(
						err,
						this._includeErrorStack
					);

					HttpErrorHelper.buildResponse(response, error, httpStatusCode);
				}
			}
		}
	}
}
