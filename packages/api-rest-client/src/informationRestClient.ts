// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type {
	HealthStatus,
	IBaseRestClientConfig,
	IHealthInfo,
	IInformationComponent,
	INoContentRequest,
	IServerFavIconResponse,
	IServerHealthResponse,
	IServerInfo,
	IServerInfoResponse,
	IServerRootResponse,
	IServerSpecResponse
} from "@twin.org/api-models";
import { NotSupportedError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * The client to connect to the information service.
 */
export class InformationRestClient extends BaseRestClient implements IInformationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<InformationRestClient>();

	/**
	 * Create a new instance of InformationRestClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<InformationRestClient>(), config, "");
	}

	/**
	 * Get the server root.
	 * @returns The root root.
	 */
	public async root(): Promise<string> {
		const response = await this.fetch<INoContentRequest, IServerRootResponse>("/", "GET");
		return response.body;
	}

	/**
	 * Get the server information.
	 * @returns The service information.
	 */
	public async info(): Promise<IServerInfo> {
		const response = await this.fetch<INoContentRequest, IServerInfoResponse>("/info", "GET");
		return response.body;
	}

	/**
	 * Get the favicon.
	 * @returns The favicon.
	 */
	public async favicon(): Promise<Uint8Array | undefined> {
		const response = await this.fetch<INoContentRequest, IServerFavIconResponse>(
			"/favicon.ico",
			"GET"
		);
		return response.body;
	}

	/**
	 * Get the OpenAPI spec.
	 * @returns The OpenAPI spec.
	 */
	public async spec(): Promise<unknown> {
		const response = await this.fetch<INoContentRequest, IServerSpecResponse>("/spec", "GET");
		return response.body;
	}

	/**
	 * Get the server health.
	 * @returns The service health.
	 */
	public async health(): Promise<IHealthInfo> {
		const response = await this.fetch<INoContentRequest, IServerHealthResponse>("/health", "GET");
		return response.body;
	}

	/**
	 * Set the status of a component.
	 * @param name The component name.
	 * @param status The status of the component.
	 * @param details The details for the status.
	 * @returns Nothing.
	 */
	public async setComponentHealth(
		name: string,
		status: HealthStatus,
		details?: string
	): Promise<void> {
		throw new NotSupportedError(InformationRestClient.CLASS_NAME, nameof("setComponentHealth"));
	}

	/**
	 * Remove the status of a component.
	 * @param name The component name.
	 * @returns Nothing.
	 */
	public async removeComponentHealth(name: string): Promise<void> {
		throw new NotSupportedError(InformationRestClient.CLASS_NAME, nameof("removeComponentHealth"));
	}
}
