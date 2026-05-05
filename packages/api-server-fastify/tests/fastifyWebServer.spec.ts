// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper, type IHttpResponse } from "@twin.org/api-models";
import { JwtMimeTypeProcessor, LoggingProcessor } from "@twin.org/api-processors";
import { ComponentFactory, HealthStatus, NotImplementedError } from "@twin.org/core";
import type { ILogEntry, ILoggingComponent } from "@twin.org/logging-models";
import { HeaderTypes, HttpMethod, HttpStatusCode } from "@twin.org/web";
import { io } from "socket.io-client";
import { FastifyWebServer } from "../src/fastifyWebServer.js";

const basePort = Math.floor(Math.random() * 1000);
let port = 13000 + basePort;

describe("api-server-fastify", () => {
	beforeEach(async () => {
		port++;
	});

	test("Can create an instance of the server", () => {
		const server = new FastifyWebServer();
		expect(server).toBeDefined();
	});

	test("Can build with no routes or processors", async () => {
		const server = new FastifyWebServer();
		await server.build();
		expect(server).toBeDefined();
	});

	test("Can fail to build with REST routes and no processors", async () => {
		const server = new FastifyWebServer();

		await expect(
			server.build(
				[],
				[
					{
						operationId: "test",
						path: "/",
						method: HttpMethod.GET,
						tag: "test",
						summary: "",
						handler: async (httpRequestContext, request) => {}
					}
				]
			)
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "fastifyWebServer.noRestProcessors"
		});
	});

	test("Can build with REST routes and processors", async () => {
		const server = new FastifyWebServer();

		let counter = 0;
		await server.build(
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, processorState) => {
						counter++;
						const req = {
							pathParams: request.pathParams,
							query: request.query,
							body: request.body
						};
						const socketRouteResponse = await route?.handler(
							{
								serverRequest: request,
								processorState
							},
							req
						);
						response.headers = socketRouteResponse.headers;
						response.statusCode = socketRouteResponse.statusCode ?? HttpStatusCode.ok;
						response.body = socketRouteResponse.body;
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/",
					method: HttpMethod.GET,
					tag: "test",
					summary: "",
					handler: async (httpRequestContext, request) => ({
						body: { data: "bar" }
					})
				}
			],
			undefined,
			undefined,
			{ port }
		);

		await server.start();

		const response = await fetch(`http://localhost:${port}/`);
		const json = await response.json();

		expect(counter).toEqual(1);
		expect(json).toEqual({ data: "bar" });

		await server.stop();
	});

	test("Can handle an error thrown inside a REST processor", async () => {
		const server = new FastifyWebServer();

		await server.build(
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, contextIds, processorState) => {
						HttpErrorHelper.buildResponse(
							response,
							{ name: "Error", message: "AuthError" },
							HttpStatusCode.unauthorized
						);
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/",
					method: HttpMethod.GET,
					tag: "test",
					summary: "",
					handler: async (httpRequestContext, request) => ({
						body: { data: "bar" }
					})
				}
			],
			undefined,
			undefined,
			{ port }
		);

		await server.start();

		const response = await fetch(`http://localhost:${port}/`);
		const json = await response.json();

		expect(response.status).toEqual(HttpStatusCode.unauthorized);
		expect(json).toEqual({ message: "AuthError", name: "Error" });

		await server.stop();
	});

	test("Can fail to build with socket routes and no processors", async () => {
		const server = new FastifyWebServer();

		await expect(
			server.build(
				undefined,
				undefined,
				[],
				[
					{
						operationId: "test",
						path: "/",
						handler: async (httpRequestContext, request) => {}
					}
				]
			)
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "fastifyWebServer.noSocketProcessors"
		});
	});

	test("Can build with socket routes and processors and receive cookies in socket operations", async () => {
		const server = new FastifyWebServer({
			config: { socket: { path: "/my-sockets" } }
		});

		let connectedSocketId = "";
		let connectedCookie = "";
		let disconnectedSocketId = "";
		let disconnectedCookie = "";
		let preSocketId = "";
		let preCookie = "";
		let preData = 0;
		let processSocketId = "";
		let processCookie = "";
		let processData = 0;
		let postSocketId = "";
		let postCookie = "";
		let postData = 0;
		await server.build(
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, contextIds, processorState) => {
						response.headers ??= {};
						response.headers[HeaderTypes.SetCookie] =
							"foo=bar; Max-Age=1000; Domain=localhost; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; SameSite=strict";
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/cookie",
					method: HttpMethod.GET,
					tag: "test",
					summary: "",
					handler: async (httpRequestContext, request) => {}
				}
			],
			[
				{
					className: () => "RouteProcessor",
					connected: async (request, route) => {
						connectedSocketId = request.socketId;
						connectedCookie = request.headers?.[HeaderTypes.Cookie] as string;
					},
					disconnected: async (request, route) => {
						disconnectedSocketId = request.socketId;
						disconnectedCookie = request.headers?.[HeaderTypes.Cookie] as string;
					},
					pre: async (request, response, route, contextIds, processorState) => {
						preSocketId = request.socketId;
						preCookie = request.headers?.[HeaderTypes.Cookie] as string;
						preData = request.body?.data as number;
					},
					process: async (request, response, route, processorState, responseEmitter) => {
						processSocketId = request.socketId;
						processCookie = request.headers?.[HeaderTypes.Cookie] as string;
						processData = request.body?.data as number;
						route?.handler(
							{
								serverRequest: request,
								processorState,
								socketId: request.socketId
							},
							{
								pathParams: request.pathParams,
								query: request.query,
								body: request.body
							},
							async (topic, socketRouteResponse) => {
								response.headers = socketRouteResponse.headers;
								response.body = socketRouteResponse.body;
								response.statusCode = socketRouteResponse.statusCode ?? HttpStatusCode.ok;
								await responseEmitter(topic, response);
							}
						);
					},
					post: async (request, response, route, requestIdentity, processorState) => {
						postSocketId = request.socketId;
						postCookie = request.headers?.[HeaderTypes.Cookie] as string;
						postData = request.body?.data as number;
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/test-namespace/ping",
					handler: async (httpRequestContext, request, responseEmitter) => {
						await responseEmitter("ping", {
							body: { data: "bar" }
						});
					}
				}
			],
			{ port }
		);

		await server.start();

		// Need to manually get and set the cookie as we are not using a browser which would
		// automatically handle this.
		const fetchResponse = await fetch(`http://localhost:${port}/cookie`);
		const cookie = fetchResponse.headers.get("set-cookie") ?? "";

		const socket = io(`http://localhost:${port}/test-namespace`, {
			path: "/my-sockets",
			withCredentials: true,
			transports: ["websocket"],
			extraHeaders: { cookie }
		});

		socket.on("connect", () => {});

		for (let i = 0; i < 20; i++) {
			if (connectedSocketId.length > 0) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		let pingResult = "";
		socket.on("ping", payload => {
			pingResult = payload.body.data;
		});

		socket.emit("ping", { body: { data: 123 } });

		for (let i = 0; i < 20; i++) {
			if (preSocketId.length > 0) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		for (let i = 0; i < 20; i++) {
			if (pingResult.length > 0) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		socket.close();

		for (let i = 0; i < 20; i++) {
			if (disconnectedSocketId.length > 0) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		await server.stop();

		expect(connectedSocketId.length > 0).toBeTruthy();
		expect(connectedCookie.length > 0).toBeTruthy();
		expect(disconnectedSocketId.length > 0).toBeTruthy();
		expect(disconnectedCookie.length > 0).toBeTruthy();
		expect(preSocketId.length > 0).toBeTruthy();
		expect(preCookie.length > 0).toBeTruthy();
		expect(preData).toEqual(123);
		expect(processSocketId.length > 0).toBeTruthy();
		expect(processCookie.length > 0).toBeTruthy();
		expect(processData).toEqual(123);
		expect(postSocketId.length > 0).toBeTruthy();
		expect(postCookie.length > 0).toBeTruthy();
		expect(postData).toEqual(123);
		expect(pingResult).toBeTruthy();
	});

	test("Can handle an error thrown inside a socket processor", async () => {
		const server = new FastifyWebServer();

		await server.build(
			undefined,
			undefined,
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, contextIds, processorState) => {
						HttpErrorHelper.buildResponse(
							response,
							{ name: "Error", message: "AuthError" },
							HttpStatusCode.unauthorized
						);
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/test-namespace/ping",
					handler: async (httpRequestContext, request, responseEmitter) => {
						await responseEmitter("ping", {
							body: { data: "bar" }
						});
					}
				}
			],
			{ port }
		);

		await server.start();

		const socket = io(`http://localhost:${port}/test-namespace`, {
			transports: ["websocket"],
			path: "/socket"
		});

		socket.on("connect", () => {});

		let pingResult: IHttpResponse | undefined;
		socket.on("ping", payload => {
			pingResult = payload;
		});

		socket.emit("ping", { data: 123 });

		for (let i = 0; i < 20; i++) {
			if (pingResult) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		socket.close();

		expect(pingResult?.statusCode).toEqual(HttpStatusCode.unauthorized);
		expect(pingResult?.body).toEqual({ message: "AuthError", name: "Error" });

		await server.stop();
	});

	test("Can response on a socket with a different topic", async () => {
		const server = new FastifyWebServer();

		await server.build(
			undefined,
			undefined,
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, processorState, responseEmitter) => {
						route?.handler(
							{
								serverRequest: request,
								processorState,
								socketId: request.socketId
							},
							{
								pathParams: request.pathParams,
								query: request.query,
								body: request.body
							},
							async (topic, socketRouteResponse) => {
								response.headers = socketRouteResponse.headers;
								response.body = socketRouteResponse.body;
								response.statusCode = socketRouteResponse.statusCode ?? HttpStatusCode.ok;
								await responseEmitter(topic, response);
							}
						);
					}
				}
			],
			[
				{
					operationId: "test",
					path: "/test-namespace/ping",
					handler: async (httpRequestContext, request, responseEmitter) => {
						await responseEmitter("pong", {
							body: { data: "bar" }
						});
					}
				}
			],
			{ port }
		);

		await server.start();

		const socket = io(`http://localhost:${port}/test-namespace`, {
			transports: ["websocket"],
			path: "/socket"
		});

		socket.on("connect", () => {});

		let pongResult: IHttpResponse | undefined;
		socket.on("pong", payload => {
			pongResult = payload;
		});

		socket.emit("ping", { data: 123 });

		for (let i = 0; i < 20; i++) {
			if (pongResult) {
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		socket.close();

		expect(pongResult).toBeTruthy();

		await server.stop();
	});

	test("Can return healthy status when server is running", async () => {
		const server = new FastifyWebServer();
		await server.build(undefined, undefined, undefined, undefined, { port });
		await server.start();

		const result = await server.health();

		await server.stop();

		expect(result).toEqual([
			{
				name: "FastifyWebServer",
				status: HealthStatus.Ok,
				details: "health.fastifyWebServer.reachable"
			}
		]);
	});

	test("Can return error status when server is not running", async () => {
		const server = new FastifyWebServer();
		await server.build(undefined, undefined, undefined, undefined, { port });

		const result = await server.health();

		expect(result).toEqual([
			{
				name: "FastifyWebServer",
				status: HealthStatus.Error,
				details: "health.fastifyWebServer.unreachable"
			}
		]);
	});

	test("Can add a custom content type processor", async () => {
		const server = new FastifyWebServer({
			mimeTypeProcessors: [new JwtMimeTypeProcessor()]
		});

		const logEntries: ILogEntry[] = [];
		let body = "";

		const logger: ILoggingComponent = {
			className: () => "logger",
			log: async (logEntry: ILogEntry) => {
				logEntries.push(logEntry);
			},
			query: async () => {
				throw new NotImplementedError("Not implemented", "");
			}
		};

		ComponentFactory.register("logging", () => logger);

		await server.build(
			[
				{
					className: () => "RouteProcessor",
					process: async (request, response, route, contextIds, processorState) => {
						body = request.body;
					}
				},
				new LoggingProcessor()
			],
			[
				{
					operationId: "test",
					path: "/",
					method: HttpMethod.POST,
					tag: "test",
					summary: "",
					handler: async (httpRequestContext, request) => {}
				}
			],
			undefined,
			undefined,
			{ port }
		);

		await server.start();

		await fetch(`http://localhost:${port}/`, {
			method: "POST",
			headers: { "Content-Type": "application/jwt" },
			body: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
		});

		expect(body).toEqual(
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
		);
		expect(logEntries.length).toEqual(2);
		expect(logEntries[0].message.startsWith("requestMessage")).toEqual(true);
		expect(logEntries[1].message.startsWith("responseMessage")).toEqual(true);

		await server.stop();
	});
});
