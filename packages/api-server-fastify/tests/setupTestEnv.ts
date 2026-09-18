// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { createServer } from "node:net";
import { Is } from "@twin.org/core";

/**
 * Ask the operating system for a free port, so that test servers do not clash
 * with each other when test files run in parallel, or with ports the host
 * has reserved.
 * @returns A port which was free at the point it was requested.
 */
export async function getFreePort(): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const server = createServer();
		server.on("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const freePort = Is.object<{ port: number }>(address) ? address.port : 0;
			server.close(() => resolve(freePort));
		});
	});
}
