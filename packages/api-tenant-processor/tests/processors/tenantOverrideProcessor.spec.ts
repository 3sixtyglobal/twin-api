// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	ForbiddenError,
	HttpContextIdKeys,
	type IHttpResponse,
	type IHttpServerRequest,
	type ITenant,
	type ITenantAdminComponent
} from "@3sixty/api-models";
import { ContextIdKeys, type IContextIds } from "@3sixty/context";
import { ComponentFactory, GeneralError, GuardError, NotFoundError } from "@3sixty/core";
import { HttpStatusCode } from "@3sixty/web";
import { TenantOverrideProcessor } from "../../src/tenantOverrideProcessor.js";

const CALLER_TENANT = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
const OVERRIDE_TENANT = "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7";
const INVALID_TENANT = "not-a-valid-tenant-id";

const OVERRIDE_TENANT_MODEL: ITenant = {
	id: OVERRIDE_TENANT,
	apiKey: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
	label: "Override",
	organizationId: "org-override",
	dateCreated: "2026-01-01T00:00:00.000Z",
	dateModified: "2026-01-01T00:00:00.000Z"
};

describe("TenantOverrideProcessor", () => {
	let mockTenantAdmin: ITenantAdminComponent;
	let processor: TenantOverrideProcessor;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantAdmin = {
			className: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			get: vi.fn().mockResolvedValue(OVERRIDE_TENANT_MODEL),
			getByApiKey: vi.fn(),
			getByPublicOrigin: vi.fn(),
			getTenantByOrganizationId: vi.fn(),
			remove: vi.fn(),
			query: vi.fn()
		};

		vi.spyOn(ComponentFactory, "get").mockReturnValue(mockTenantAdmin);

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
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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
		expect(mockTenantAdmin.get).not.toHaveBeenCalled();
	});

	it("should return 403 when override-tenant is supplied but caller lacks escalated privilege", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin"
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
		expect(mockTenantAdmin.get).not.toHaveBeenCalled();
	});

	it("should return 403 when caller has no scope at all", async () => {
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

	it("should return 404 when override-tenant does not exist in the system", async () => {
		vi.mocked(mockTenantAdmin.get).mockRejectedValue(
			new NotFoundError("tenantAdminService", "tenantNotFound", OVERRIDE_TENANT)
		);

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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
		expect((response.body as { message: string }).message).toBe(
			"tenantOverrideProcessor.tenantNotFound"
		);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should substitute the tenant partition and store the original when override is valid", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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
		expect(mockTenantAdmin.get).toHaveBeenCalledWith(OVERRIDE_TENANT);
	});

	it("should respond with 403 body containing the error name", async () => {
		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin"
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
	it("should return 404 when the override tenant id is not well formed", async () => {
		vi.mocked(mockTenantAdmin.get).mockRejectedValue(
			new GuardError("tenantAdminService", "guard.stringHexLength", "tenantId", INVALID_TENANT)
		);

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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

	it("should return 404 when the component returns a tenant with a different id", async () => {
		vi.mocked(mockTenantAdmin.get).mockResolvedValue({
			...OVERRIDE_TENANT_MODEL,
			id: CALLER_TENANT
		});

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
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

	it("should pass a component fault through rather than reporting it as a missing tenant", async () => {
		vi.mocked(mockTenantAdmin.get).mockRejectedValue(
			new GeneralError("tenantAdminService", "storageUnavailable")
		);

		const contextIds: IContextIds = {
			[ContextIdKeys.Tenant]: CALLER_TENANT,
			[HttpContextIdKeys.Scope]: "user-admin,global-admin"
		};
		const response: IHttpResponse = {};
		await processor.pre(
			{ query: { "override-tenant": OVERRIDE_TENANT } } as unknown as IHttpServerRequest,
			response,
			{ operationId: "tenantGetById", path: "/" },
			contextIds,
			{}
		);

		expect(response.statusCode).toBe(HttpStatusCode.internalServerError);
		expect(contextIds[ContextIdKeys.Tenant]).toBe(CALLER_TENANT);
	});

	it("should resolve the tenant admin component under the default name", () => {
		const componentFactorySpy = vi.spyOn(ComponentFactory, "get");

		const overrideProcessor = new TenantOverrideProcessor();

		expect(overrideProcessor.className()).toBe(TenantOverrideProcessor.CLASS_NAME);
		expect(componentFactorySpy).toHaveBeenCalledWith("tenant-admin");
	});

	it("should resolve the tenant admin component under a configured name", () => {
		const componentFactorySpy = vi.spyOn(ComponentFactory, "get");

		const overrideProcessor = new TenantOverrideProcessor({
			tenantAdminComponentType: "custom-tenant-admin"
		});

		expect(overrideProcessor.className()).toBe(TenantOverrideProcessor.CLASS_NAME);
		expect(componentFactorySpy).toHaveBeenCalledWith("custom-tenant-admin");
	});
});
