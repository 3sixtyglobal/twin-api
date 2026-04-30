// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IBaseRestClientConfig, IHttpRequest, IHttpResponse } from "@twin.org/api-models";
import { HeaderTypes, HttpStatusCode, MimeTypes } from "@twin.org/web";
import { BaseRestClient } from "../src/clients/baseRestClient.js";

class TestRestClient extends BaseRestClient {
	public static readonly CLASS_NAME: string = "TestRestClient";

	constructor(config: IBaseRestClientConfig) {
		super(TestRestClient.CLASS_NAME, config, "test-prefix");
	}

	public className(): string {
		return TestRestClient.CLASS_NAME;
	}
}

const fetchMock = vi.fn();

describe("BaseRestClient", () => {
	beforeEach(() => {
		globalThis.fetch = fetchMock;
	});

	afterEach(() => {
		fetchMock.mockReset();
	});

	test("can merge per-request headers into outgoing request", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ok,
			headers: new Headers({
				[HeaderTypes.ContentType]: MimeTypes.Json
			}),
			json: async () => ({ success: true })
		});

		const client = new TestRestClient({ endpoint: "http://localhost:8080" });

		await client.fetch<IHttpRequest, IHttpResponse>("/resource", "GET", {
			headers: {
				[HeaderTypes.Authorization]: "Bearer test-token",
				[HeaderTypes.Accept]: MimeTypes.JsonLd
			}
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, fetchOptions] = fetchMock.mock.calls[0];
		expect(fetchOptions.headers[HeaderTypes.Authorization]).toBe("Bearer test-token");
		expect(fetchOptions.headers[HeaderTypes.Accept]).toBe(MimeTypes.JsonLd);
	});

	test("per-request headers override instance-level headers", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ok,
			headers: new Headers({
				[HeaderTypes.ContentType]: MimeTypes.Json
			}),
			json: async () => ({ success: true })
		});

		const client = new TestRestClient({
			endpoint: "http://localhost:8080",
			headers: {
				[HeaderTypes.Accept]: MimeTypes.Json
			}
		});

		await client.fetch<IHttpRequest, IHttpResponse>("/resource", "GET", {
			headers: {
				[HeaderTypes.Accept]: MimeTypes.JsonLd
			}
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, fetchOptions] = fetchMock.mock.calls[0];
		expect(fetchOptions.headers[HeaderTypes.Accept]).toBe(MimeTypes.JsonLd);
	});

	test("request without per-request headers still works", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ok,
			headers: new Headers({
				[HeaderTypes.ContentType]: MimeTypes.Json
			}),
			json: async () => ({ success: true })
		});

		const client = new TestRestClient({
			endpoint: "http://localhost:8080",
			headers: {
				[HeaderTypes.Accept]: MimeTypes.Json
			}
		});

		await client.fetch<IHttpRequest, IHttpResponse>("/resource", "GET");

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, fetchOptions] = fetchMock.mock.calls[0];
		expect(fetchOptions.headers[HeaderTypes.Accept]).toBe(MimeTypes.Json);
	});

	test("query string in endpoint URL is preserved on every outgoing request", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ok,
			headers: new Headers({
				[HeaderTypes.ContentType]: MimeTypes.Json
			}),
			json: async () => ({ success: true })
		});

		const client = new TestRestClient({
			endpoint: "http://localhost:8080?tenantToken=abc123"
		});

		await client.fetch<IHttpRequest, IHttpResponse>("/resource", "GET");

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [outgoingUrl] = fetchMock.mock.calls[0];
		expect(outgoingUrl).toBe("http://localhost:8080/test-prefix/resource?tenantToken=abc123");
	});

	test("endpoint query params are merged with per-request query params", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ok,
			headers: new Headers({
				[HeaderTypes.ContentType]: MimeTypes.Json
			}),
			json: async () => ({ success: true })
		});

		const client = new TestRestClient({
			endpoint: "http://localhost:8080?tenantToken=abc123"
		});

		await client.fetch<IHttpRequest, IHttpResponse>("/resource", "GET", {
			query: { page: "2" }
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [outgoingUrl] = fetchMock.mock.calls[0];
		expect(outgoingUrl).toBe(
			"http://localhost:8080/test-prefix/resource?tenantToken=abc123&page=2"
		);
	});
});
