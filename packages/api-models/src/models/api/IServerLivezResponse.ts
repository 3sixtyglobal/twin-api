// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HeaderTypes, MimeTypes } from "@twin.org/web";

/**
 * The livez of the server.
 */
export interface IServerLivezResponse {
	/**
	 * The headers for the response.
	 */
	headers: {
		[HeaderTypes.ContentType]: typeof MimeTypes.PlainText;
	};

	/**
	 * The livez information for the server.
	 */
	body: "ok" | "failed";
}
