// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IBaseRestClientConfig, IHttpRequest, IHttpResponse } from "@twin.org/api-models";
import { HttpUrlHelper } from "@twin.org/api-models";
import {
	BaseError,
	Coerce,
	Guards,
	type IError,
	Is,
	StringHelper,
	type IKeyValue
} from "@twin.org/core";
import { nameof, nameofCamelCase } from "@twin.org/nameof";
import {
	FetchError,
	FetchHelper,
	HeaderTypes,
	HttpMethod,
	HttpStatusCode,
	MimeTypes,
	type IHttpHeaders
} from "@twin.org/web";

/**
 * Abstract client class for common REST processing.
 */
export abstract class BaseRestClient {
	/**
	 * The name of the class implementation REST calls.
	 * @internal
	 */
	private readonly _implementationName: string;

	/**
	 * The endpoint origin without prefix.
	 * @internal
	 */
	private readonly _endpointOrigin: string;

	/**
	 * The endpoint with prefix to send the requests to.
	 * @internal
	 */
	private readonly _endpointWithPrefix: string;

	/**
	 * Query parameters parsed from the configured endpoint URL. Preserved on every
	 * outbound request so that callers using endpoints like
	 * `https://host?tenant-token=…` don't lose routing data when the route+query are
	 * appended to the base URL.
	 * @internal
	 */
	private readonly _endpointQuery: IKeyValue<string>[];

	/**
	 * The headers to include in requests.
	 * @internal
	 */
	private readonly _headers?: IHttpHeaders;

	/**
	 * Timeout for requests in ms.
	 * @internal
	 */
	private readonly _timeout?: number;

	/**
	 * Include credentials in the request, defaults to true.
	 * @internal
	 */
	private readonly _includeCredentials: boolean;

	/**
	 * Hook to provide headers asynchronously.
	 * @internal
	 */
	private readonly _customHeaders?: () => Promise<IHttpHeaders>;

	/**
	 * Hook to provide auth header asynchronously.
	 * @internal
	 */
	private readonly _customAuthHeader?: () => Promise<string>;

	/**
	 * Hook to handle authorization failures asynchronously.
	 * @internal
	 */
	private readonly _onAuthFailure?: (error: IError) => Promise<void>;

	/**
	 * Create a new instance of BaseRestClient.
	 * @param implementationName The name of the class implementation REST calls.
	 * @param config The configuration for the client.
	 * @param pathPrefix The default prefix to use if none in configuration.
	 */
	constructor(implementationName: string, config: IBaseRestClientConfig, pathPrefix: string) {
		Guards.stringValue(implementationName, nameof(implementationName), implementationName);
		Guards.object<IBaseRestClientConfig>(implementationName, nameof(config), config);
		Guards.stringValue(implementationName, nameof(config.endpoint), config.endpoint);

		this._headers = config.headers;
		this._timeout = config.timeout;
		this._includeCredentials = config.includeCredentials ?? true;

		this._implementationName = implementationName;

		// Parse the endpoint as a URL so any query string the caller embedded is preserved
		// rather than concatenated as part of the path.
		this._endpointQuery = [];
		let parsedEndpoint: URL | undefined;
		try {
			parsedEndpoint = new URL(config.endpoint);
		} catch {}

		if (Is.empty(parsedEndpoint)) {
			this._endpointOrigin = StringHelper.trimTrailingSlashes(config.endpoint);
		} else {
			for (const [key, value] of parsedEndpoint.searchParams.entries()) {
				this._endpointQuery.push({ key, value });
			}
			parsedEndpoint.search = "";
			this._endpointOrigin = StringHelper.trimTrailingSlashes(parsedEndpoint.toString());
		}

		this._endpointWithPrefix = this._endpointOrigin;
		const finalPathPrefix = config.pathPrefix ?? pathPrefix;
		if (Is.stringValue(finalPathPrefix)) {
			this._endpointWithPrefix += `/${finalPathPrefix}`;
		}

		this._customAuthHeader = config.customAuthHeader;
		this._customHeaders = config.customHeaders;
		this._onAuthFailure = config.onAuthFailure;
	}

	/**
	 * Get the endpoint with the prefix for the namespace.
	 * @returns The endpoint with namespace prefix attached.
	 */
	public getEndpointWithPrefix(): string {
		return this._endpointWithPrefix;
	}

	/**
	 * Perform a request in json format.
	 * @param route The route of the request.
	 * @param method The http method.
	 * @param request Request to send to the endpoint.
	 * @param options Optional override options for the request.
	 * @param options.overridePrefix Optional override prefix to use for this request instead of the default prefix.
	 * @returns The response.
	 */
	public async fetch<T extends IHttpRequest, U extends IHttpResponse>(
		route: string,
		method: HttpMethod,
		request?: T,
		options?: { overridePrefix?: string }
	): Promise<U> {
		Guards.stringValue(this._implementationName, nameof(route), route);
		Guards.arrayOneOf(this._implementationName, nameof(method), method, Object.values(HttpMethod));

		const routeParts = route.split("/");

		for (let i = 0; i < routeParts.length; i++) {
			if (routeParts[i].startsWith(":")) {
				const routeProp = routeParts[i].slice(1);
				const pathValue = request?.pathParams?.[routeProp];
				if (Is.notEmpty(pathValue)) {
					routeParts[i] = Coerce.string(pathValue) ?? "";
					delete request?.pathParams?.[routeProp];
				} else {
					throw new FetchError(
						this._implementationName,
						`${nameofCamelCase<BaseRestClient>()}.missingRouteProp`,
						HttpStatusCode.badRequest,
						{ route, routeProp }
					);
				}
			}
		}

		// Preserve endpoint-level query params (parsed once in the constructor)
		// alongside any per-request query params.
		const queryKeyPairs: IKeyValue<string>[] = [...this._endpointQuery];

		const isHttpRequest = Is.notEmpty(request);

		if (isHttpRequest) {
			const query = request?.query;
			if (Is.object(query)) {
				for (const qp in query) {
					const propValue = query[qp];
					if (Is.stringValue(propValue) || Is.number(propValue) || Is.boolean(propValue)) {
						const ids = queryKeyPairs.findIndex(q => q.key === qp);
						if (ids !== -1) {
							queryKeyPairs.splice(ids, 1);
						}
						queryKeyPairs.push({
							key: qp,
							value: propValue.toString()
						});
					}
				}
				delete request?.query;
			}
		}

		let finalRoute = routeParts.map(rp => HttpUrlHelper.encodeUriPathSegment(rp)).join("/");
		if (finalRoute === "/") {
			finalRoute = "";
		}
		if (queryKeyPairs.length > 0) {
			finalRoute += `?${queryKeyPairs
				.map(qp => `${encodeURIComponent(qp.key)}=${encodeURIComponent(qp.value)}`)
				.join("&")}`;
		}

		const body = isHttpRequest && request?.body ? JSON.stringify(request?.body) : undefined;

		let requestHeaders: IHttpHeaders = {};

		if (body) {
			requestHeaders[HeaderTypes.ContentType] = MimeTypes.Json;
		}

		if (Is.object(this._headers)) {
			requestHeaders = { ...requestHeaders, ...this._headers };
		}

		if (Is.object(request?.headers)) {
			requestHeaders = { ...requestHeaders, ...request.headers };
		}

		if (Is.function(this._customHeaders)) {
			const customHeaders = await this._customHeaders();
			if (Is.object(customHeaders)) {
				requestHeaders = { ...requestHeaders, ...customHeaders };
			}
		}

		if (Is.function(this._customAuthHeader)) {
			const authHeader = await this._customAuthHeader();
			if (Is.stringValue(authHeader)) {
				requestHeaders[HeaderTypes.Authorization] = authHeader;
			}
		}

		let baseUrl;

		if (Is.string(options?.overridePrefix)) {
			baseUrl =
				options.overridePrefix.length > 0
					? `${this._endpointOrigin}/${options.overridePrefix}`
					: this._endpointOrigin;
		} else {
			baseUrl = this._endpointWithPrefix;
		}

		const response = await FetchHelper.fetch(
			this._implementationName,
			`${baseUrl}${finalRoute}`,
			method,
			body,
			{
				headers: requestHeaders,
				timeoutMs: this._timeout,
				includeCredentials: this._includeCredentials
			}
		);

		if (response.ok) {
			try {
				const httpResponse: IHttpResponse = {};

				const contentType =
					response.headers.get(HeaderTypes.ContentType) ??
					response.headers.get(HeaderTypes.ContentType.toLowerCase()) ??
					"";

				if (response.status !== HttpStatusCode.noContent) {
					if (contentType.includes(MimeTypes.PlainText)) {
						httpResponse.body = await response.text();
					} else if (
						contentType.includes(MimeTypes.Json) ||
						contentType.includes(MimeTypes.JsonLd)
					) {
						httpResponse.body = await response.json();
					} else {
						httpResponse.body = new Uint8Array(await response.arrayBuffer());
						if (httpResponse.body.length === 0) {
							delete httpResponse.body;
						}
					}
				}

				const responseHeaders: IHttpHeaders = {};
				for (const header of response.headers.entries()) {
					responseHeaders[header[0]] = header[1];
				}

				if (Object.keys(responseHeaders).length > 0) {
					httpResponse.headers = responseHeaders;
				}

				if (response.status !== HttpStatusCode.ok) {
					httpResponse.statusCode = response.status as HttpStatusCode;
				}

				return httpResponse as U;
			} catch (err) {
				throw new FetchError(
					this._implementationName,
					`${nameofCamelCase<BaseRestClient>()}.decodingFailed`,
					response.status as HttpStatusCode,
					{
						route
					},
					err
				);
			}
		}

		const errResponse = await response.json();
		let err: BaseError | undefined;
		if (
			response.status >= HttpStatusCode.badRequest &&
			Is.object(errResponse) &&
			Is.stringValue(errResponse.message)
		) {
			err = BaseError.fromError(errResponse);
		}

		err ??= new FetchError(
			this._implementationName,
			`${nameofCamelCase<BaseRestClient>()}.failureStatusText`,
			response.status as HttpStatusCode,
			{
				statusText: response.statusText ?? response.status,
				route: finalRoute,
				response: errResponse
			}
		);

		if (response.status === HttpStatusCode.unauthorized && Is.function(this._onAuthFailure)) {
			try {
				await this._onAuthFailure(err);
			} catch {
				// Silently ignore errors from the auth failure handler as we want to throw the original error
				// in this case to preserve the original failure context for logging and handling by callers
			}
		}

		throw err;
	}
}
