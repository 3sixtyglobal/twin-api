// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GuardError } from "@twin.org/core";
import { HttpMethod } from "@twin.org/web";
import { EntityStorageAuthenticationAuditRestClient } from "../src/entityStorageAuthenticationAuditRestClient.js";
import {
	createdResponse,
	jsonResponse,
	setupFetchMock,
	teardownFetchMock
} from "./helpers/restClientTestHelpers.js";

// OpenAPI spec: ../../api-auth-entity-storage-service/docs/open-api/spec.json
const ENDPOINT = "http://localhost:8080";
const PREFIX = "authentication/audit";

const TEST_ENTRY = {
	event: "login-success",
	actorId: "user@example.com",
	organizationId: "did:example:org1"
};

const TEST_AUDIT_ENTRIES = [
	{
		id: "018f0b53d5d5704fa3a06d6ed2478575",
		event: "login-success",
		dateCreated: "2026-01-12T09:05:23.123Z",
		actorId: "user@example.com"
	}
];

const fetchMock = vi.fn();

describe("EntityStorageAuthenticationAuditRestClient", () => {
	let client: EntityStorageAuthenticationAuditRestClient;

	beforeEach(() => {
		setupFetchMock(fetchMock);
		client = new EntityStorageAuthenticationAuditRestClient({ endpoint: ENDPOINT });
	});

	afterEach(() => {
		teardownFetchMock(fetchMock);
	});

	describe("create", () => {
		test("throws when entry is undefined", async () => {
			await expect(client.create(undefined as never)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.objectUndefined"
			});
		});

		test("throws when entry.event is empty", async () => {
			await expect(client.create({ ...TEST_ENTRY, event: "" })).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to the resource root", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse("018f0b53d5d5704fa3a06d6ed2478575"));

			await client.create(TEST_ENTRY);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the audit entry as the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse("018f0b53d5d5704fa3a06d6ed2478575"));

			await client.create(TEST_ENTRY);

			const [, options] = fetchMock.mock.calls[0];
			expect(JSON.parse(options.body)).toEqual(TEST_ENTRY);
		});

		test("returns the id from the Location response header", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse("018f0b53d5d5704fa3a06d6ed2478575"));

			const result = await client.create(TEST_ENTRY);

			expect(result).toBe("018f0b53d5d5704fa3a06d6ed2478575");
		});
	});

	describe("query", () => {
		test("sends GET to the resource root", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ entries: [] }));

			await client.query();

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("includes provided filter options as query params in the URL", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ entries: [] }));

			await client.query({ actorId: "user@example.com", event: "login-success" });

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("actorId=user%40example.com");
			expect(url).toContain("event=login-success");
		});

		test("includes cursor and limit as query params when provided", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ entries: [] }));

			await client.query(undefined, "next-cursor", 50);

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("cursor=next-cursor");
			expect(url).toContain("limit=50");
		});

		test("omits undefined filter options from the query string", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ entries: [] }));

			await client.query({ actorId: "user@example.com" });

			const [url] = fetchMock.mock.calls[0];
			expect(url).not.toContain("organizationId");
			expect(url).not.toContain("tenantId");
		});

		test("returns entries and cursor from the response body", async () => {
			fetchMock.mockResolvedValueOnce(
				jsonResponse({ entries: TEST_AUDIT_ENTRIES, cursor: "next-cursor" })
			);

			const result = await client.query();

			expect(result.entries).toEqual(TEST_AUDIT_ENTRIES);
			expect(result.cursor).toBe("next-cursor");
		});

		test("returns undefined cursor when not present in the response", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ entries: TEST_AUDIT_ENTRIES }));

			const result = await client.query();

			expect(result.cursor).toBeUndefined();
		});
	});
});
