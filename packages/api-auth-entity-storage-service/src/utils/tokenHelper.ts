// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is, UnauthorizedError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { type IVaultConnector, VaultConnectorHelper } from "@twin.org/vault-models";
import {
	CookieHelper,
	HeaderHelper,
	HeaderTypes,
	type IHttpHeaders,
	type IJwtHeader,
	type IJwtPayload,
	Jwt
} from "@twin.org/web";

/**
 * Helper class for token operations.
 */
export class TokenHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TokenHelper>();

	/**
	 * Create a new token.
	 * @param vaultConnector The vault connector.
	 * @param signingKeyName The signing key name.
	 * @param userIdentity The subject for the token.
	 * @param organizationIdentity The organization for the token.
	 * @param tenantId The tenant id for the token.
	 * @param ttlMinutes The time to live for the token in minutes.
	 * @param scope The scopes for the token.
	 * @returns The new token and its expiry date.
	 */
	public static async createToken(
		vaultConnector: IVaultConnector,
		signingKeyName: string,
		userIdentity: string,
		organizationIdentity: string | undefined,
		tenantId: string | undefined,
		ttlMinutes: number,
		scope?: string
	): Promise<{
		token: string;
		expiry: number;
	}> {
		const nowSeconds = Math.trunc(Date.now() / 1000);
		const ttlSeconds = ttlMinutes * 60;

		const jwt = await Jwt.encodeWithSigner(
			{ alg: "EdDSA" },
			{
				sub: userIdentity,
				org: organizationIdentity,
				tid: tenantId,
				exp: nowSeconds + ttlSeconds,
				scope
			},
			async (header, payload) =>
				VaultConnectorHelper.jwtSigner(vaultConnector, signingKeyName, header, payload)
		);

		return {
			token: jwt,
			expiry: (nowSeconds + ttlSeconds) * 1000
		};
	}

	/**
	 * Verify the token.
	 * @param vaultConnector The vault connector.
	 * @param signingKeyName The signing key name.
	 * @param token The token to verify.
	 * @param requiredScopes The required scopes.
	 * @param verifyUser A function to verify the user identity and organization, which can be used to check if the user is still active or not.
	 * @returns The verified details.
	 * @throws UnauthorizedError if the token is missing, invalid or expired.
	 */
	public static async verify(
		vaultConnector: IVaultConnector,
		signingKeyName: string,
		token: string | undefined,
		requiredScopes?: string[],
		verifyUser?: (userIdentity: string, organizationIdentity: string) => Promise<string[]>
	): Promise<{
		header: IJwtHeader;
		payload: IJwtPayload;
	}> {
		if (!Is.stringValue(token)) {
			throw new UnauthorizedError(TokenHelper.CLASS_NAME, "missing");
		}

		const decoded = await Jwt.verifyWithVerifier(token, async t =>
			VaultConnectorHelper.jwtVerifier(vaultConnector, signingKeyName, t)
		);

		// If some of the header/payload data is not properly populated then it is unauthorized.
		if (!Is.stringValue(decoded.payload.sub)) {
			throw new UnauthorizedError(TokenHelper.CLASS_NAME, "payloadMissingSubject");
		} else if (!Is.stringValue(decoded.payload.org)) {
			throw new UnauthorizedError(TokenHelper.CLASS_NAME, "payloadMissingOrganization");
		} else if (
			!Is.empty(decoded.payload?.exp) &&
			decoded.payload.exp < Math.trunc(Date.now() / 1000)
		) {
			throw new UnauthorizedError(TokenHelper.CLASS_NAME, "expired");
		}

		if (Is.function(verifyUser)) {
			const userVerified = await verifyUser(decoded.payload.sub, decoded.payload.org);
			if (!userVerified.includes("user")) {
				throw new UnauthorizedError(TokenHelper.CLASS_NAME, "userNotVerified");
			} else if (!userVerified.includes("organization")) {
				throw new UnauthorizedError(TokenHelper.CLASS_NAME, "organizationNotVerified");
			}
		}

		if (Is.arrayValue(requiredScopes)) {
			const tokenScopes = Is.stringValue(decoded.payload.scope)
				? decoded.payload.scope.split(",")
				: [];

			for (const requiredScope of requiredScopes) {
				if (!tokenScopes.includes(requiredScope)) {
					throw new UnauthorizedError(TokenHelper.CLASS_NAME, "insufficientScopes");
				}
			}
		}

		return {
			header: decoded.header,
			payload: decoded.payload
		};
	}

	/**
	 * Extract the auth token from the headers, either from the authorization header or the cookie header.
	 * @param headers The headers to extract the token from.
	 * @param cookieName The name of the cookie to extract the token from.
	 * @returns The token if found.
	 */
	public static extractTokenFromHeaders(
		headers?: IHttpHeaders,
		cookieName?: string
	):
		| {
				token: string;
				location: "authorization" | "cookie";
		  }
		| undefined {
		const authHeader = headers?.[HeaderTypes.Authorization];
		const cookiesHeader = headers?.[HeaderTypes.Cookie];

		const bearerToken = HeaderHelper.extractBearer(authHeader);
		if (Is.stringValue(bearerToken)) {
			return {
				token: bearerToken,
				location: "authorization"
			};
		} else if (Is.notEmpty(cookiesHeader) && Is.stringValue(cookieName)) {
			const value = CookieHelper.getCookieFromHeaders(cookiesHeader, cookieName);
			if (Is.stringValue(value)) {
				return {
					token: value,
					location: "cookie"
				};
			}
		}
	}
}
