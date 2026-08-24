// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HealthCategory,
	HealthStatus,
	type IHealthComponent,
	type IHttpRequestContext,
	type INoContentRequest,
	type IRestRoute,
	type IServerHealthResponse,
	type ITag
} from "@twin.org/api-models";
import { ComponentFactory } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * The tag to associate with the routes.
 */
export const tagsHealth: ITag[] = [
	{
		name: "Health",
		description: "Health endpoints for the REST server."
	}
];

/**
 * The REST routes for server health.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesHealth(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const healthRoute: IRestRoute<INoContentRequest, IServerHealthResponse> = {
		operationId: "serverHealth",
		summary: "Get the health for the server",
		tag: tagsHealth[0].name,
		method: "GET",
		path: `${baseRouteName}/`,
		handler: async (httpRequestContext, request) =>
			serverHealth(httpRequestContext, componentName, request),
		responseType: [
			{
				type: nameof<IServerHealthResponse>(),
				examples: [
					{
						id: "healthResponseOK",
						description: "The response for the health request.",
						response: {
							body: {
								status: HealthStatus.Ok,
								components: [
									{
										source: "Database",
										status: HealthStatus.Ok,
										category: HealthCategory.Connectivity
									},
									{
										source: "Storage",
										status: HealthStatus.Ok,
										category: HealthCategory.Connectivity
									}
								]
							}
						}
					},
					{
						id: "healthResponseWarning",
						description: "The response for the health request with warnings.",
						response: {
							body: {
								status: HealthStatus.Warning,
								components: [
									{
										source: "Database",
										status: HealthStatus.Warning,
										description: "slowRunning",
										category: HealthCategory.Connectivity
									},
									{
										source: "Storage",
										status: HealthStatus.Ok,
										category: HealthCategory.Connectivity
									}
								]
							}
						}
					},
					{
						id: "healthResponseError",
						description: "The response for the health request with errors.",
						response: {
							body: {
								status: "error",
								components: [
									{
										source: "Database",
										status: "ok",
										category: HealthCategory.Connectivity
									},
									{
										source: "Storage",
										status: "error",
										description: "storageFull",
										category: HealthCategory.Connectivity
									}
								]
							}
						}
					}
				]
			}
		]
	};

	return [healthRoute];
}

/**
 * Get the health for the server.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function serverHealth(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INoContentRequest
): Promise<IServerHealthResponse> {
	const component = ComponentFactory.get<IHealthComponent>(componentName);
	return {
		body: await component.healthStatus()
	};
}
