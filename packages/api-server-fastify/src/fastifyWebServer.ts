// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import FastifyCompress from "@fastify/compress";
import FastifyCors from "@fastify/cors";
import {
	type HealthApplicationCallback,
	HealthStatus,
	HttpBodyLimit,
	HttpContextIdKeys,
	HttpErrorHelper,
	type IHealthProviderComponent,
	type IBaseRoute,
	type IBaseRouteProcessor,
	type IHealth,
	type IHttpRequest,
	type IHttpRequestPathParams,
	type IHttpRequestQuery,
	type IHttpResponse,
	type IHttpServerRequest,
	type IMimeTypeProcessor,
	type IRestRoute,
	type IRestRouteProcessor,
	type ISocketRoute,
	type ISocketRouteProcessor,
	type ISocketServerRequest,
	type IWebServer,
	type IWebServerOptions,
	HealthCategory
} from "@twin.org/api-models";
import { JsonLdMimeTypeProcessor } from "@twin.org/api-processors";
import { ContextIdStore, type IContextIds } from "@twin.org/context";
import {
	BaseError,
	ComponentFactory,
	GeneralError,
	type IError,
	Is,
	RandomHelper,
	StringHelper,
	Url
} from "@twin.org/core";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import {
	HeaderTypes,
	HttpMethod,
	HttpStatusCode,
	type IHttpHeaders,
	HeaderHelper,
	MimeTypes
} from "@twin.org/web";
import Fastify, {
	type FastifyInstance,
	type FastifyReply,
	type FastifyRequest,
	type FastifyServerOptions
} from "fastify";
import type { Server, ServerOptions, Socket } from "socket.io";
import FastifySocketIO from "./fastifySocketIo.js";
import type { IFastifyWebServerConstructorOptions } from "./models/IFastifyWebServerConstructorOptions.js";

/**
 * Implementation of the web server using Fastify.
 */
export class FastifyWebServer implements IWebServer<FastifyInstance>, IHealthProviderComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<FastifyWebServer>();

	/**
	 * Default port for running the server.
	 * @internal
	 */
	private static readonly _DEFAULT_PORT: number = 3000;

	/**
	 * Default host for running the server.
	 * @internal
	 */
	private static readonly _DEFAULT_HOST: string = "localhost";

	/**
	 * Default named body size limits for routes.
	 * @internal
	 */
	private static readonly _DEFAULT_BODY_LIMITS: { [name: string]: number } = {
		[HttpBodyLimit.Default]: 1048576,
		[HttpBodyLimit.Large]: 26214400
	};

	/**
	 * The logging component type.
	 * @internal
	 */
	private readonly _loggingComponentType?: string;

	/**
	 * The logging component.
	 * @internal
	 */
	private readonly _logging?: ILoggingComponent;

	/**
	 * The options for the server.
	 * @internal
	 */
	private _options?: IWebServerOptions;

	/**
	 * The Fastify instance.
	 * @internal
	 */
	private readonly _fastify: FastifyInstance;

	/**
	 * The options for the socket server.
	 * @internal
	 */
	private readonly _socketConfig: Partial<ServerOptions>;

	/**
	 * Whether the server has been started.
	 * @internal
	 */
	private _started: boolean;

	/**
	 * The mime type processors.
	 * @internal
	 */
	private readonly _mimeTypeProcessors: IMimeTypeProcessor[];

	/**
	 * Include the stack with errors.
	 * @internal
	 */
	private readonly _includeErrorStack: boolean;

	/**
	 * The public origin of the server, used for constructing the request URL and for CORS.
	 * @internal
	 */
	private _publicOrigin?: string;

	/**
	 * The local origin of the server, used for constructing the request URL and for CORS.
	 * @internal
	 */
	private _localOrigin?: string;

	/**
	 * Create a new instance of FastifyWebServer.
	 * @param options The options for the server.
	 */
	constructor(options?: IFastifyWebServerConstructorOptions) {
		this._loggingComponentType = options?.loggingComponentType;
		this._logging = ComponentFactory.getIfExists(options?.loggingComponentType);
		this._fastify = Fastify({
			routerOptions: {
				maxParamLength: 2000
			},
			...options?.config?.web
			// Need this cast for now as maxParamLength has moved in to routerOptions
			// but the TS defs has not been updated yet
		} as unknown as FastifyServerOptions);
		this._socketConfig = {
			path: "/socket",
			...options?.config?.socket
		};
		this._started = false;

		this._mimeTypeProcessors = options?.mimeTypeProcessors ?? [];

		const hasJsonLd = this._mimeTypeProcessors.some(processor =>
			processor.getTypes().includes(MimeTypes.JsonLd)
		);
		if (!hasJsonLd) {
			this._mimeTypeProcessors.push(new JsonLdMimeTypeProcessor());
		}

		this._includeErrorStack = options?.config?.includeErrorStack ?? false;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FastifyWebServer.CLASS_NAME;
	}

	/**
	 * Get the web server instance.
	 * @returns The web server instance.
	 */
	public getInstance(): FastifyInstance {
		return this._fastify;
	}

	/**
	 * Build the server.
	 * @param restRouteProcessors The processors for incoming requests over REST.
	 * @param restRoutes The REST routes.
	 * @param socketRouteProcessors The processors for incoming requests over Sockets.
	 * @param socketRoutes The socket routes.
	 * @param options Options for building the server.
	 * @returns A promise that resolves when the server is fully built and ready to start.
	 */
	public async build(
		restRouteProcessors?: IRestRouteProcessor[],
		restRoutes?: IRestRoute[],
		socketRouteProcessors?: ISocketRouteProcessor[],
		socketRoutes?: ISocketRoute[],
		options?: IWebServerOptions
	): Promise<void> {
		if (Is.arrayValue(restRoutes) && !Is.arrayValue(restRouteProcessors)) {
			throw new GeneralError(FastifyWebServer.CLASS_NAME, "noRestProcessors");
		}
		if (Is.arrayValue(socketRoutes) && !Is.arrayValue(socketRouteProcessors)) {
			throw new GeneralError(FastifyWebServer.CLASS_NAME, "noSocketProcessors");
		}
		await this._logging?.log({
			level: "info",
			ts: Date.now(),
			source: FastifyWebServer.CLASS_NAME,
			message: "building"
		});

		let localHost = options?.host ?? "127.0.0.1";
		if (localHost === "0.0.0.0") {
			localHost = "127.0.0.1";
		}

		this._localOrigin = `http://${localHost}:${options?.port ?? 3000}`;

		if (Is.stringValue(options?.publicOrigin)) {
			const publicUrl = Url.tryParseExact(options.publicOrigin);
			if (!Is.empty(publicUrl)) {
				const urlParts = publicUrl.parts();
				this._publicOrigin = `${urlParts.schema}://${urlParts.host}${Is.integer(urlParts.port) ? `:${urlParts.port}` : ""}`;
			} else {
				throw new GeneralError(FastifyWebServer.CLASS_NAME, "invalidPublicOrigin", {
					publicOrigin: options.publicOrigin
				});
			}
		}

		this._options = options;

		await this._fastify.register(FastifyCompress);

		if (Is.arrayValue(socketRoutes)) {
			await this._fastify.register(FastifySocketIO, this._socketConfig);
		}

		if (Is.arrayValue(this._mimeTypeProcessors)) {
			for (const contentTypeHandler of this._mimeTypeProcessors) {
				this._fastify.addContentTypeParser(
					contentTypeHandler.getTypes(),
					{ parseAs: "buffer" },
					(request, body, done) => {
						// Fastify does not handle this method correctly if it is async
						// so we have to use the callback method
						contentTypeHandler
							.handle(body as Buffer)
							// eslint-disable-next-line promise/prefer-await-to-then, promise/no-callback-in-promise
							.then(processed => done(null, processed))
							// eslint-disable-next-line promise/prefer-await-to-then, promise/no-callback-in-promise
							.catch(err => done(BaseError.fromError(err)));
					}
				);
			}
		}

		await this.initCors(options);

		this._fastify.setNotFoundHandler({}, async (request, reply) =>
			this.handleRequestRest(restRouteProcessors ?? [], request, reply)
		);

		this._fastify.setErrorHandler(
			async (
				error: Error & {
					code?: number | string;
					statusCode?: number | string;
				},
				request,
				reply
			) => {
				// If code property is set this is a fastify error
				// otherwise it's from our framework
				let httpStatusCode: HttpStatusCode;
				let err: IError;
				if (Is.number(error.code) || Is.string(error.code)) {
					err = {
						source: FastifyWebServer.CLASS_NAME,
						name: error.name,
						message: `${error.code}: ${error.message}`
					};
					httpStatusCode = (error.statusCode as HttpStatusCode) ?? HttpStatusCode.badRequest;
				} else {
					const errorAndCode = HttpErrorHelper.processError(error);
					err = errorAndCode.error;
					httpStatusCode = errorAndCode.httpStatusCode;
				}

				await this._logging?.log({
					level: "error",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "badRequest",
					error: err
				});

				return reply.status(httpStatusCode).send({
					error: err
				});
			}
		);

		await this.addRoutesRest(restRouteProcessors, restRoutes);
		await this.addRoutesSocket(socketRouteProcessors, socketRoutes);
	}

	/**
	 * Start the server.
	 * @returns A promise that resolves when the server is listening for connections.
	 */
	public async start(): Promise<void> {
		const host = this._options?.host ?? FastifyWebServer._DEFAULT_HOST;
		const port = this._options?.port ?? FastifyWebServer._DEFAULT_PORT;

		await this._logging?.log({
			level: "info",
			ts: Date.now(),
			source: FastifyWebServer.CLASS_NAME,
			message: "starting",
			data: {
				host,
				port
			}
		});

		if (!this._started) {
			try {
				await this._fastify.listen({ port, host });
				const addresses = this._fastify.addresses();

				const protocol = Is.object(this._fastify.initialConfig.https) ? "https://" : "http://";
				const normalizeAnyHost = (address: string): string => {
					if (address === "0.0.0.0") {
						return "127.0.0.1";
					}
					if (address === "::") {
						return "::1";
					}

					return address;
				};

				const formatAddress = (
					address: string,
					family?: string,
					forceProtocol?: string
				): string => {
					const displayAddress = normalizeAnyHost(address);
					const isIPv6 =
						family === "IPv6" || (Is.stringValue(displayAddress) && displayAddress.includes(":"));

					return `${forceProtocol ?? protocol}${isIPv6 ? "[" : ""}${displayAddress}${isIPv6 ? "]" : ""}`;
				};

				const startupAddresses = addresses.map(a => {
					const formatted = formatAddress(a.address, a.family, protocol);

					return `${formatted}:${a.port}`;
				});

				for (const origin of [this._localOrigin, this._publicOrigin]) {
					if (Is.stringValue(origin)) {
						const originUrl = Url.tryParseExact(origin);
						if (!Is.empty(originUrl)) {
							const originParts = originUrl.parts();
							const formatted = formatAddress(
								originParts.host,
								undefined,
								`${originParts.schema}://`
							);
							startupAddresses.push(
								`${formatted}${Is.integer(originParts.port) ? `:${originParts.port}` : ""}`
							);
						} else {
							startupAddresses.push(origin);
						}
					}
				}

				const distinctStartupAddresses = [...new Set(startupAddresses)];

				await this._logging?.log({
					level: "info",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "started",
					data: {
						addresses: distinctStartupAddresses.join(", ")
					}
				});
				this._started = true;
			} catch (err) {
				await this._logging?.log({
					level: "error",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "startFailed",
					error: BaseError.fromError(err)
				});
			}
		}
	}

	/**
	 * Stop the server.
	 * @returns A promise that resolves when the server has shut down all connections.
	 */
	public async stop(): Promise<void> {
		if (this._started) {
			this._started = false;

			await this._fastify.close();

			await this._logging?.log({
				level: "info",
				ts: Date.now(),
				source: FastifyWebServer.CLASS_NAME,
				message: "stopped"
			});
		}
	}

	/**
	 * Returns the health status of the component.
	 * @returns The health status of the component, can return multiple entries for elements within the component.
	 */
	public async health(): Promise<IHealth[]> {
		let healthCheck: IHealth | undefined;
		if (this._fastify?.server?.listening) {
			healthCheck = {
				source: FastifyWebServer.CLASS_NAME,
				status: HealthStatus.Ok,
				category: HealthCategory.Connectivity,
				description: "healthConnectivityDescription",
				message: "reachable"
			};
		} else {
			healthCheck = {
				source: FastifyWebServer.CLASS_NAME,
				status: HealthStatus.Error,
				category: HealthCategory.Connectivity,
				description: "healthConnectivityDescription",
				message: "unreachable"
			};
		}

		return [healthCheck];
	}

	/**
	 * Verify the root endpoint is reachable and returns a body by making a real HTTP request.
	 * Skipped when GET / is not registered on this server instance.
	 * @param callback The callback to invoke when a deferred health result is ready.
	 * @returns The application health status of the component.
	 */
	public async healthApplication(
		callback: HealthApplicationCallback
	): Promise<IHealth[] | undefined> {
		if (!this._fastify.hasRoute({ method: "GET", url: "/" })) {
			return [];
		}

		if (!Is.stringValue(this._localOrigin)) {
			return [
				{
					source: FastifyWebServer.CLASS_NAME,
					status: HealthStatus.Error,
					category: HealthCategory.Application,
					description: "healthApplicationDescription",
					message: "serverNotBuilt"
				}
			];
		}

		try {
			const response = await fetch(`${this._localOrigin}/`);
			const body = await response.text();

			if (response.ok && Is.stringValue(body)) {
				return [
					{
						source: FastifyWebServer.CLASS_NAME,
						status: HealthStatus.Ok,
						category: HealthCategory.Application,
						description: "healthApplicationDescription",
						message: "rootEndpointReachable"
					}
				];
			}

			return [
				{
					source: FastifyWebServer.CLASS_NAME,
					status: HealthStatus.Error,
					category: HealthCategory.Application,
					description: "healthApplicationDescription",
					message: "rootEndpointError"
				}
			];
		} catch (error) {
			return [
				{
					source: FastifyWebServer.CLASS_NAME,
					status: HealthStatus.Error,
					category: HealthCategory.Application,
					description: "healthApplicationDescription",
					error: BaseError.fromError(error)
				}
			];
		}
	}

	/**
	 * Add the REST routes to the server.
	 * @param restRouteProcessors The processors for the incoming requests.
	 * @param restRoutes The REST routes to add.
	 * @internal
	 */
	private async addRoutesRest(
		restRouteProcessors?: IRestRouteProcessor[],
		restRoutes?: IRestRoute[]
	): Promise<void> {
		if (Is.arrayValue(restRouteProcessors) && Is.arrayValue(restRoutes)) {
			const bodyLimits = this.resolveBodyLimits();
			for (const restRoute of restRoutes) {
				let path = StringHelper.trimTrailingSlashes(restRoute.path);
				if (!path.startsWith("/")) {
					path = `/${path}`;
				}
				await this._logging?.log({
					level: "info",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "restRouteAdded",
					data: { route: path, method: restRoute.method }
				});
				const method = restRoute.method.toLowerCase() as
					"get" | "post" | "put" | "patch" | "delete" | "options" | "head";

				const bodyLimitKey = Is.stringValue(restRoute.bodyLimit)
					? restRoute.bodyLimit
					: HttpBodyLimit.Default;
				const bodyLimit = bodyLimits[bodyLimitKey];
				if (Is.empty(bodyLimit)) {
					throw new GeneralError(FastifyWebServer.CLASS_NAME, "unknownBodyLimit", {
						route: path,
						bodyLimit: bodyLimitKey
					});
				}

				this._fastify[method](path, { bodyLimit }, async (request, reply) =>
					this.handleRequestRest(restRouteProcessors, request, reply, restRoute)
				);
			}
		}
	}

	/**
	 * Merge the configured body limits over the built-in ones and validate them.
	 * @returns The named body limits in bytes.
	 * @throws GeneralError If a limit is not a positive integer.
	 * @internal
	 */
	private resolveBodyLimits(): { [name: string]: number } {
		const bodyLimits = {
			...FastifyWebServer._DEFAULT_BODY_LIMITS,
			...this._options?.bodyLimits
		};
		for (const name of Object.keys(bodyLimits)) {
			const bodyLimit = bodyLimits[name];
			if (!Is.integer(bodyLimit) || bodyLimit <= 0) {
				throw new GeneralError(FastifyWebServer.CLASS_NAME, "invalidBodyLimit", {
					bodyLimit: name,
					value: bodyLimit
				});
			}
		}
		return bodyLimits;
	}

	/**
	 * Add the socket routes to the server.
	 * @param socketRouteProcessors The processors for the incoming requests.
	 * @param socketRoutes The socket routes to add.
	 * @internal
	 */
	private async addRoutesSocket(
		socketRouteProcessors?: ISocketRouteProcessor[],
		socketRoutes?: ISocketRoute[]
	): Promise<void> {
		if (Is.arrayValue(socketRouteProcessors) && Is.arrayValue(socketRoutes)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const io: Server = (this._fastify as any).io;

			for (const socketRoute of socketRoutes) {
				const path = StringHelper.trimLeadingSlashes(
					StringHelper.trimTrailingSlashes(socketRoute.path)
				);
				const pathParts = path.split("/");

				const namespace = `/${pathParts[0]}`;
				const topic = pathParts.slice(1).join("/");

				await this._logging?.log({
					level: "info",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "socketRouteAdded",
					data: {
						handshakePath: this._socketConfig.path,
						namespace,
						eventName: topic
					}
				});

				const socketNamespace = io.of(namespace);

				socketNamespace.on("connection", async socket => {
					const socketServerRequest: ISocketServerRequest = {
						method: HttpMethod.GET,
						url: socket.handshake.url,
						query: socket.handshake.query as IHttpRequestQuery,
						headers: socket.handshake.headers as IHttpHeaders,
						socketId: socket.id
					};

					// Pass the connected information on to any processors
					try {
						for (const socketRouteProcessor of socketRouteProcessors) {
							if (socketRouteProcessor.connected) {
								await socketRouteProcessor.connected(
									socketServerRequest,
									socketRoute,
									this._loggingComponentType
								);
							}
						}
					} catch (err) {
						const { error, httpStatusCode } = HttpErrorHelper.processError(
							err,
							this._includeErrorStack
						);
						const response: IHttpResponse = {};
						HttpErrorHelper.buildResponse(response, error, httpStatusCode, this._includeErrorStack);
						socket.emit(topic, response);
					}

					socket.on("disconnect", async () => {
						try {
							// The socket disconnected so notify any processors
							for (const socketRouteProcessor of socketRouteProcessors) {
								if (socketRouteProcessor.disconnected) {
									await socketRouteProcessor.disconnected(
										socketServerRequest,
										socketRoute,
										this._loggingComponentType
									);
								}
							}
						} catch {
							// If something fails on a disconnect there is not much we can do with it
						}
					});

					// Handle any incoming messages
					socket.on(topic, async data => {
						await this.handleRequestSocket(
							socketRouteProcessors,
							socketRoute,
							socket,
							`/${pathParts.join("/")}`,
							topic,
							data
						);
					});
				});
			}
		}
	}

	/**
	 * Handle the incoming REST request.
	 * @param restRouteProcessors The hooks to process the incoming requests.
	 * @param request The incoming request.
	 * @param reply The outgoing response.
	 * @param restRoute The REST route to handle.
	 * @returns The Fastify reply with the response.
	 * @internal
	 */
	private async handleRequestRest(
		restRouteProcessors: IRestRouteProcessor[],
		request: FastifyRequest,
		reply: FastifyReply,
		restRoute?: IRestRoute
	): Promise<FastifyReply> {
		const port =
			(request.port === 80 && request.protocol === "http") ||
			(request.port === 443 && request.protocol === "https") ||
			!Is.integer(request.port)
				? ""
				: `:${request.port}`;

		const requestOrigin = `${request.protocol}://${request.hostname}${port}`;

		const httpServerRequest: IHttpServerRequest = {
			method: request.method.toUpperCase() as HttpMethod,
			url: `${requestOrigin}${request.url}`,
			body: request.body,
			query: request.query as IHttpRequestQuery,
			pathParams: request.params as IHttpRequestPathParams,
			headers: request.headers as IHttpHeaders
		};

		const httpResponse: IHttpResponse = {};
		const contextIds: IContextIds = {
			[HttpContextIdKeys.IpAddress]: HeaderHelper.extractClientIps(httpServerRequest.headers).join(
				"|"
			),
			[HttpContextIdKeys.UserAgent]: HeaderHelper.extractUserAgent(httpServerRequest.headers),
			[HttpContextIdKeys.CorrelationId]: HeaderHelper.extractCorrelationId(
				httpServerRequest.headers
			),
			[HttpContextIdKeys.RemoteRequest]: RandomHelper.generateUuidV7("compact"),
			[HttpContextIdKeys.LocalOrigin]: this._localOrigin,
			// This can be overridden by a processor if needed, for example a tenant processor
			[HttpContextIdKeys.PublicOrigin]: this._publicOrigin ?? requestOrigin ?? this._localOrigin
		};
		const processorState = restRoute?.processorData ?? {};

		if (Is.object(httpServerRequest.pathParams)) {
			for (const key of Object.keys(httpServerRequest.pathParams)) {
				httpServerRequest.pathParams[key] = decodeURIComponent(httpServerRequest.pathParams[key]);
			}
		}
		if (Is.object(httpServerRequest.query)) {
			for (const key of Object.keys(httpServerRequest.query)) {
				httpServerRequest.query[key] = decodeURIComponent(httpServerRequest.query[key]);
			}
		}

		await this.runProcessorsRest(
			restRouteProcessors,
			restRoute,
			httpServerRequest,
			httpResponse,
			contextIds,
			processorState
		);

		if (!Is.empty(httpResponse.headers)) {
			for (const header of Object.keys(httpResponse.headers)) {
				reply.header(header, httpResponse.headers[header]);
			}
		}
		return reply.status(httpResponse.statusCode ?? HttpStatusCode.ok).send(httpResponse.body);
	}

	/**
	 * Run the REST processors for the route.
	 * @param restRouteProcessors The processors to run.
	 * @param restRoute The route to process.
	 * @param httpServerRequest The incoming request.
	 * @param httpResponse The outgoing response.
	 * @param contextIds The context IDs of the request.
	 * @internal
	 */
	private async runProcessorsRest(
		restRouteProcessors: IRestRouteProcessor[],
		restRoute: IRestRoute | undefined,
		httpServerRequest: IHttpServerRequest,
		httpResponse: IHttpResponse,
		contextIds: IContextIds,
		processorState: {
			[id: string]: unknown;
		}
	): Promise<void> {
		let hasPreError = false;
		const filteredProcessors = this.filterRouteProcessors(restRoute, restRouteProcessors);

		try {
			// Run inside ContextIdStore.run so pre-processors can do tenant-scoped storage lookups.
			await ContextIdStore.run(contextIds, async () => {
				for (const routeProcessor of filteredProcessors) {
					const pre = routeProcessor.pre?.bind(routeProcessor);
					if (Is.function(pre)) {
						await pre(httpServerRequest, httpResponse, restRoute, contextIds, processorState, {
							loggingComponentType: this._loggingComponentType
						});
					}
				}
			});
		} catch (err) {
			const { error, httpStatusCode } = HttpErrorHelper.processError(err, this._includeErrorStack);
			HttpErrorHelper.buildResponse(httpResponse, error, httpStatusCode, this._includeErrorStack);
			hasPreError = true;
		}

		// A pre-processor may set an error response without throwing; treat that as halt.
		if (
			!hasPreError &&
			Is.integer(httpResponse.statusCode) &&
			httpResponse.statusCode >= HttpStatusCode.badRequest
		) {
			hasPreError = true;
		}

		// Don't run the main processing if there was an error in the pre processing
		// As this is likely to perform tasks such as authentication which may have failed
		if (!hasPreError) {
			try {
				// Run the processors within an async context
				// so that any services can access the context ids
				await ContextIdStore.run(contextIds, async () => {
					for (const routeProcessor of filteredProcessors) {
						const process = routeProcessor.process?.bind(routeProcessor);
						if (Is.function(process)) {
							await process(httpServerRequest, httpResponse, restRoute, processorState, {
								loggingComponentType: this._loggingComponentType
							});
						}
					}
				});
			} catch (err) {
				const { error, httpStatusCode } = HttpErrorHelper.processError(
					err,
					this._includeErrorStack
				);
				HttpErrorHelper.buildResponse(httpResponse, error, httpStatusCode, this._includeErrorStack);
			}
		}

		try {
			// Always run the post processors, even if there was an error earlier
			// as they may perform cleanup tasks, or logging etc
			await ContextIdStore.run(contextIds, async () => {
				for (const routeProcessor of filteredProcessors) {
					const post = routeProcessor.post?.bind(routeProcessor);
					if (Is.function(post)) {
						await post(httpServerRequest, httpResponse, restRoute, contextIds, processorState, {
							loggingComponentType: this._loggingComponentType
						});
					}
				}
			});
		} catch (err) {
			// Just log post processor errors
			await this._logging?.log({
				level: "error",
				ts: Date.now(),
				source: FastifyWebServer.CLASS_NAME,
				message: "postProcessorError",
				error: BaseError.fromError(err),
				data: {
					route: restRoute?.path ?? ""
				}
			});
		}
	}

	/**
	 * Filter the route processors based on the requested features.
	 * @param route The route to process.
	 * @param routeProcessors The processors to filter.
	 * @returns The filtered list of route processor.
	 * @internal
	 */
	private filterRouteProcessors<T extends IBaseRouteProcessor>(
		route: IBaseRoute | undefined,
		routeProcessors: T[]
	): T[] {
		const requestedFeatures = route?.processorFeatures ?? [];

		if (!Is.arrayValue(requestedFeatures)) {
			// If there are no requested features, we just return all the processors
			return routeProcessors;
		}

		// Reduce the list of route processors to just those in the requested features list
		const reducedProcessors = routeProcessors.filter(routeProcessor => {
			// Processors that do not define any features always get run
			// If the route processor has features defined, then we only run it
			// if the route has at least one of those features required
			let runRouteProcessor = true;
			if (routeProcessor.features) {
				const routeProcessorFeatures = routeProcessor.features();
				runRouteProcessor = routeProcessorFeatures.some(feature =>
					requestedFeatures.includes(feature)
				);
			}
			return runRouteProcessor;
		});

		return reducedProcessors;
	}

	/**
	 * Handle the incoming socket request.
	 * @param socketRouteProcessors The hooks to process the incoming requests.
	 * @param socketRoute The socket route to handle.
	 * @param socket The socket to handle.
	 * @param fullPath The full path of the socket route.
	 * @param emitTopic The topic to emit the response on.
	 * @param request The incoming request.
	 * @internal
	 */
	private async handleRequestSocket(
		socketRouteProcessors: ISocketRouteProcessor[],
		socketRoute: ISocketRoute,
		socket: Socket,
		fullPath: string,
		emitTopic: string,
		request: IHttpRequest
	): Promise<void> {
		const socketServerRequest: ISocketServerRequest = {
			method: HttpMethod.GET,
			url: fullPath,
			query: socket.handshake.query as IHttpRequestQuery,
			headers: socket.handshake.headers as IHttpHeaders,
			body: request.body,
			socketId: socket.id
		};
		const httpResponse: IHttpResponse = {};
		const contextIds: IContextIds = {};
		const processorState = {};

		delete socketServerRequest.query?.EIO;
		delete socketServerRequest.query?.transport;

		await this.runProcessorsSocket(
			socketRouteProcessors,
			socketRoute,
			socketServerRequest,
			httpResponse,
			contextIds,
			processorState,
			emitTopic,
			async (topic, response) => {
				socket.emit(topic, response);
			}
		);
	}

	/**
	 * Run the socket processors for the route.
	 * @param socketRouteProcessors The processors to run.
	 * @param socketRoute The route to process.
	 * @param socketServerRequest The incoming request.
	 * @param httpResponse The outgoing response.
	 * @param contextIds The context IDs of the request.
	 * @param processorState The state handed through the processors.
	 * @param requestTopic The topic of the request.
	 * @param responseEmitter The emitter to send the response on.
	 * @internal
	 */
	private async runProcessorsSocket(
		socketRouteProcessors: ISocketRouteProcessor[],
		socketRoute: ISocketRoute,
		socketServerRequest: ISocketServerRequest,
		httpResponse: IHttpResponse,
		contextIds: IContextIds,
		processorState: {
			[id: string]: unknown;
		},
		requestTopic: string,
		responseEmitter: (topic: string, response: IHttpResponse) => Promise<void>
	): Promise<void> {
		const filteredProcessors = this.filterRouteProcessors(socketRoute, socketRouteProcessors);

		// Custom emit method which will also call the post processors
		const postProcessEmit = async (
			topic: string,
			response: IHttpResponse,
			responseProcessorState: {
				[id: string]: unknown;
			}
		): Promise<void> => {
			await responseEmitter(topic, response);

			try {
				// The post processors are called after the response has been emitted
				for (const postSocketRouteProcessor of filteredProcessors) {
					const post = postSocketRouteProcessor.post?.bind(postSocketRouteProcessor);
					if (Is.function(post)) {
						await post(
							socketServerRequest,
							response,
							socketRoute,
							contextIds,
							responseProcessorState,
							{
								loggingComponentType: this._loggingComponentType
							}
						);
					}
				}
			} catch (err) {
				await this._logging?.log({
					level: "error",
					ts: Date.now(),
					source: FastifyWebServer.CLASS_NAME,
					message: "postProcessorError",
					error: BaseError.fromError(err),
					data: {
						route: socketRoute.path
					}
				});
			}
		};

		try {
			for (const socketRouteProcessor of filteredProcessors) {
				const pre = socketRouteProcessor.pre?.bind(socketRouteProcessor);
				if (Is.function(pre)) {
					await pre(socketServerRequest, httpResponse, socketRoute, contextIds, processorState, {
						loggingComponentType: this._loggingComponentType
					});
				}
			}

			// We always call all the processors regardless of any response set by a previous processor.
			// But if a pre processor sets a status code, we will emit the response manually, as the pre
			// and post processors do not receive the emit method, they just populate the response object.
			if (!Is.empty(httpResponse.statusCode)) {
				await postProcessEmit(requestTopic, httpResponse, processorState);
			}

			await ContextIdStore.run(contextIds, async () => {
				for (const socketRouteProcessor of filteredProcessors) {
					const process = socketRouteProcessor.process?.bind(socketRouteProcessor);
					if (Is.function(process)) {
						await process(
							socketServerRequest,
							httpResponse,
							socketRoute,
							processorState,
							async (topic: string, processResponse: IHttpResponse) => {
								await postProcessEmit(topic, processResponse, processorState);
							},
							this._loggingComponentType
						);
					}
				}
			});

			// If the processors set the status to any kind of error then we should emit this manually
			if (
				Is.integer(httpResponse.statusCode) &&
				httpResponse.statusCode >= HttpStatusCode.badRequest
			) {
				await postProcessEmit(requestTopic, httpResponse, processorState);
			}
		} catch (err) {
			// Emit any unhandled errors manually
			const { error, httpStatusCode } = HttpErrorHelper.processError(err, this._includeErrorStack);
			HttpErrorHelper.buildResponse(httpResponse, error, httpStatusCode, this._includeErrorStack);
			await postProcessEmit(requestTopic, httpResponse, processorState);
		}
	}

	/**
	 * Initialize the cors options.
	 * @param options The web server options.
	 * @internal
	 */
	private async initCors(options?: IWebServerOptions): Promise<void> {
		let origins: string[] = ["*"];

		if (Is.arrayValue(options?.corsOrigins)) {
			origins = options?.corsOrigins;
		} else if (Is.stringValue(options?.corsOrigins)) {
			origins = [options?.corsOrigins];
		}

		const hasWildcardOrigin = origins.includes("*");

		const methods = options?.methods ?? [
			HttpMethod.GET,
			HttpMethod.PUT,
			HttpMethod.POST,
			HttpMethod.DELETE,
			HttpMethod.OPTIONS
		];
		const allowedHeaders = [
			"Access-Control-Allow-Origin",
			"Content-Encoding",
			"Accept-Encoding",
			HeaderTypes.ContentType,
			HeaderTypes.Authorization,
			HeaderTypes.Accept
		];
		const exposedHeaders: string[] = [HeaderTypes.ContentDisposition, HeaderTypes.Location];

		if (Is.arrayValue(options?.allowedHeaders)) {
			allowedHeaders.push(...options.allowedHeaders);
		}
		if (Is.arrayValue(options?.exposedHeaders)) {
			exposedHeaders.push(...options.exposedHeaders);
		}

		await this._fastify.register(FastifyCors, {
			origin: (origin, callback) => {
				callback(null, hasWildcardOrigin ? true : origins.includes(origin as string));
			},
			methods,
			allowedHeaders,
			exposedHeaders,
			credentials: true
		});
	}
}
