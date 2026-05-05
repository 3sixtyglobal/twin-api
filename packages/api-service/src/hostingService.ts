// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpUrlHelper,
	type IHostingComponent,
	type ITenantAdminComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { IHostingServiceConstructorOptions } from "./models/IHostingServiceConstructorOptions.js";

/**
 * The hosting service for the server.
 */
export class HostingService implements IHostingComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HostingService>();

	/**
	 * The tenant admin component.
	 * @internal
	 */
	private readonly _tenantAdminComponentType?: string;

	/**
	 * The local origin URL e.g. "http://localhost:3000".
	 * @internal
	 */
	private readonly _localOrigin: string;

	/**
	 * The APIs public base URL e.g. "https://api.example.com:1234".
	 * @internal
	 */
	private readonly _publicOrigin?: string;

	/**
	 * Create a new instance of HostingService.
	 * @param options The options to create the service.
	 */
	constructor(options: IHostingServiceConstructorOptions) {
		Guards.object(HostingService.CLASS_NAME, nameof(options), options);
		Guards.object(HostingService.CLASS_NAME, nameof(options.config), options.config);
		Guards.stringValue(
			HostingService.CLASS_NAME,
			nameof(options.config.localOrigin),
			options.config.localOrigin
		);
		this._tenantAdminComponentType = options?.tenantAdminComponentType ?? "tenant-admin";
		this._localOrigin = options.config.localOrigin;
		this._publicOrigin = options.config.publicOrigin;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return HostingService.CLASS_NAME;
	}

	/**
	 * Get the public origin for the hosting.
	 * @param serverRequestUrl The url of the current server request if there is one.
	 * @returns The public origin.
	 */
	public async getPublicOrigin(serverRequestUrl?: string): Promise<string> {
		const contextIds = await ContextIdStore.getContextIds();
		const tenantId = contextIds?.[ContextIdKeys.Tenant];
		let tenantPublicOrigin;
		if (Is.stringValue(tenantId)) {
			tenantPublicOrigin = await this.getTenantOrigin(tenantId);
		}

		const serverRequestOrigin = Is.stringValue(serverRequestUrl)
			? HttpUrlHelper.extractOrigin(serverRequestUrl)
			: undefined;

		return tenantPublicOrigin ?? this._publicOrigin ?? serverRequestOrigin ?? this._localOrigin;
	}

	/**
	 * Get the public origin for the tenant if one exists.
	 * @param tenantId The tenant identifier.
	 * @returns The public origin for the tenant.
	 */
	public async getTenantOrigin(tenantId: string): Promise<string | undefined> {
		Guards.stringHexLength(HostingService.CLASS_NAME, nameof(tenantId), tenantId, 32);

		const tenantAdminComponent = ComponentFactory.getIfExists<ITenantAdminComponent>(
			this._tenantAdminComponentType
		);

		if (Is.empty(tenantAdminComponent)) {
			return undefined;
		}

		const tenant = await tenantAdminComponent.get(tenantId);
		return tenant?.publicOrigin;
	}

	/**
	 * Build a public url based on the public origin and the url provided.
	 * @param url The url to build upon the public origin.
	 * @returns The full url based on the public origin.
	 */
	public async buildPublicUrl(url: string): Promise<string> {
		const publicOrigin = await this.getPublicOrigin(url);
		return HttpUrlHelper.replaceOrigin(url, publicOrigin);
	}
}
