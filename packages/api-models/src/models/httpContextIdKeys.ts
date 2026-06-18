// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * HTTP definition of some context keys.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HttpContextIdKeys = {
	/**
	 * IP address of the client.
	 */
	IpAddress: "ipAddress",

	/**
	 * User agent of the client.
	 */
	UserAgent: "userAgent",

	/**
	 * Correlation ID of the request.
	 */
	CorrelationId: "correlationId",

	/**
	 * Public Origin of the request.
	 */
	PublicOrigin: "publicOrigin",

	/**
	 * Local Origin of the request.
	 */
	LocalOrigin: "localOrigin"
} as const;

/**
 * HTTP definition of some context keys.
 */
export type HttpContextIdKeys = (typeof HttpContextIdKeys)[keyof typeof HttpContextIdKeys];
