// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	ForbiddenError,
	HttpContextIdKeys,
	type IHttpResponse,
	type IHttpServerRequest
} from "@twin.org/api-models";
import { ContextIdKeys, type IContextIds } from "@twin.org/context";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { HttpStatusCode } from "@twin.org/web";
import type { Tenant } from "../../src/entities/tenant.js";
import { TenantOverrideProcessor } from "../../src/tenantOverrideProcessor.js";

const CALLER_TENANT = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
const OVERRIDE_TENANT = "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7";
const INVALID_TENANT = "not-a-valid-tenant-id";

describe("TenantOverrideProcessor", () => {
	let mockStorage: IEntityStorageConnector<Tenant>;
	let processor: TenantOverrideProcessor;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockStorage = {
			getSchema: vi.fn(),
			set: vi.fn(),
			get: vi.fn().mockResolvedValue({ id: OVERRIDE_TENANT }),
			remove: vi.fn(),
			query: vi.fn()
		} as unknown as IEntityStorageConnector<Tenant>;

		vi.spyOn(EntityStorageConnectorFactory, "get").mockReturnValue(mockStorage);

		processor = new TenantOverrideProcessor();
	});

	it("should return the class name", () => {
		expect(processor.className()).toBe(TenantOverrideProcessor.CLASS_NAME);
	});

	it("should skip processing when route is undefined", async () => {
		const contextIds: IContextIds = { [ContextIdKeys.Tenant]: CALLER_TENANT };
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			undefined,
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should skip processing when route explicitly disables tenant override", async () => {
		const contextIds: IContextIds = { [ContextIdKeys.Tenant]: CALLER_TENANT };
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "someRoute", path: "/", disableTenantOverride: true },
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should skip processing when override-tenant query param is absent", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin,global-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: {} } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should skip processing when response already has a status code set", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin,global-admin"
		};
		const response: IHttpResponse = { statusCode: HttpStatusCode.unauthorized };
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
		expect(mockStorage.get).not.toHaveBeenCalled();
	});

	it("should return 403 when override-tenant is supplied but caller lacks escalated privilege", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.forbidden);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
		expect(mockStorage.get).not.toHaveBeenCalled();
	});

	it("should return 403 when caller has no roles at all", async () => {
		const contextIds: IContextIds = { [ContextIdKeys.Tenant]: CALLER_TENANT };
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.forbidden);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should return 404 when override-tenant does not match a known tenant", async () => {
		vi.mocked(mockStorage.get).mockResolvedValue(undefined);

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin,global-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": INVALID_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.notFound);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should return 404 when override-tenant does not exist in the system", async () => {
		vi.mocked(mockStorage.get).mockResolvedValue(undefined);

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin,global-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.notFound);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should substitute the tenant partition and store the original when override is valid", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin,global-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBeUndefined();
		expect(contextIds[ContextIdKeys.Tenant]).toBe(OVERRIDE_TENANT);
		expect(contextIds[HttpContextIdKeys.OriginalTenant]).toBe(CALLER_TENANT);
		expect(mockStorage.get).toHaveBeenCalledWith(OVERRIDE_TENANT);
	});

	it("should respond with 403 body containing the error name", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Roles]: "user-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.forbidden);
		const body = response.body as { name: string };
		expect(body.name).toBe(ForbiddenError.CLASS_NAME);
	});
});
