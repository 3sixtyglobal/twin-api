// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuditCreateRequest,
	IAuditQueryRequest,
	IAuditQueryResponse,
	IAuthenticationAuditComponent
} from "@twin.org/api-auth-entity-storage-models";
import {
	HttpHeaderHelper,
	type ICreatedResponse,
	type IHttpRequestContext,
	type IRestRoute,
	type ITag,
	type IUnauthorizedResponse
} from "@twin.org/api-models";
import { Coerce, ComponentFactory, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { HeaderTypes, HttpStatusCode, type IHttpHeaders } from "@twin.org/web";

/**
 * The source used when communicating about these routes.
 */
const ROUTES_SOURCE = "authenticationAuditRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsAuthenticationAudit: ITag[] = [
	{
		name: "Authentication Audit",
		description: "Authentication audit endpoints for the REST server."
	}
];

/**
 * The REST routes for authentication audit.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesAuthenticationAudit(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const createRoute: IRestRoute<IAuditCreateRequest, ICreatedResponse> = {
		operationId: "authenticationAuditCreate",
		summary: "Create an authentication audit entry",
		tag: tagsAuthenticationAudit[0].name,
		method: "POST",
		path: `${baseRouteName}`,
		handler: async (httpRequestContext, request) =>
			authenticationAuditCreate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAuditCreateRequest>(),
			examples: [
				{
					id: "authenticationAuditCreateRequestExample",
					description: "The request to create an authentication audit entry.",
					request: {
						body: {
							actorId: "user@example.com",
							event: "login-success",
							data: {
								organizationIdentity: "did:example:org1"
							}
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "authenticationAuditCreateResponseExample",
						description: "The response for creating an authentication audit entry.",
						response: {
							statusCode: 201,
							headers: {
								[HeaderTypes.Location]: "018f0b53d5d5704fa3a06d6ed2478575"
							}
						}
					}
				]
			},
			{
				type: nameof<IUnauthorizedResponse>()
			}
		],
		requiredScope: ["user-admin"]
	};

	const queryRoute: IRestRoute<IAuditQueryRequest, IAuditQueryResponse> = {
		operationId: "authenticationAuditQuery",
		summary: "Query authentication audit entries",
		tag: tagsAuthenticationAudit[0].name,
		method: "GET",
		path: `${baseRouteName}`,
		handler: async (httpRequestContext, request) =>
			authenticationAuditQuery(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAuditQueryRequest>(),
			examples: [
				{
					id: "authenticationAuditQueryRequestExample",
					description: "The request to query authentication audit entries.",
					request: {
						query: {
							actorId: "user@example.com",
							event: "login-success",
							startDate: "2026-01-01T00:00:00.000Z",
							endDate: "2026-01-31T23:59:59.999Z",
							limit: "50"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IAuditQueryResponse>(),
				examples: [
					{
						id: "authenticationAuditQueryResponseExample",
						description: "The response for querying authentication audit entries.",
						response: {
							body: {
								entries: [
									{
										id: "018f0b53d5d5704fa3a06d6ed2478575",
										actorId: "user@example.com",
										dateCreated: "2026-01-12T09:05:23.123Z",
										event: "login-success",
										data: {
											organizationIdentity: "did:example:org1"
										}
									}
								],
								cursor: "next-cursor"
							}
						}
					}
				]
			},
			{
				type: nameof<IUnauthorizedResponse>()
			}
		],
		requiredScope: ["user-admin"]
	};

	return [createRoute, queryRoute];
}

/**
 * Create an authentication audit entry.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function authenticationAuditCreate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAuditCreateRequest
): Promise<ICreatedResponse> {
	Guards.object<IAuditCreateRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAuditCreateRequest["body"]>(ROUTES_SOURCE, nameof(request.body), request.body);

	const component = ComponentFactory.get<IAuthenticationAuditComponent>(componentName);
	const id = await component.create(request.body);

	const headers: IHttpHeaders = {};
	HttpHeaderHelper.buildId(headers, id);

	return {
		statusCode: HttpStatusCode.created,
		headers
	};
}

/**
 * Query authentication audit entries.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function authenticationAuditQuery(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAuditQueryRequest
): Promise<IAuditQueryResponse> {
	Guards.object<IAuditQueryRequest>(ROUTES_SOURCE, nameof(request), request);

	const component = ComponentFactory.get<IAuthenticationAuditComponent>(componentName);
	const result = await component.query(
		{
			actorId: request.query?.actorId,
			organizationId: request.query?.organizationId,
			tenantId: request.query?.tenantId,
			nodeId: request.query?.nodeId,
			event: request.query?.event,
			startDate: request.query?.startDate,
			endDate: request.query?.endDate
		},
		request.query?.cursor,
		Coerce.integer(request.query?.limit)
	);

	return {
		body: {
			entries: result.entries,
			cursor: result.cursor
		}
	};
}
