// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Server, type ServerOptions } from "socket.io";

/**
 * Fastify plugin that attaches a Socket.IO server to the Fastify HTTP server.
 * Cloned from fastify-socket.io to support recent Fastify versions.
 */
const fastifySocketIO: FastifyPluginAsync<Partial<ServerOptions>> = fp(
	async (fastify: FastifyInstance, opts: Partial<ServerOptions>) => {
		const ioServer = new Server(fastify.server, opts);

		fastify.decorate("io", ioServer);
		fastify.addHook("preClose", async () => {
			ioServer.disconnectSockets();

			await ioServer.close();
		});
	},
	{ fastify: ">=5.x.x", name: "socket.io" }
);

export default fastifySocketIO;
