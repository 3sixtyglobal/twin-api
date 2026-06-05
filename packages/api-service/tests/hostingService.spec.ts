// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpUrlHelper, type ITenant, type ITenantAdminComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory } from "@twin.org/core";
import { HostingService } from "../src/hostingService.js";

const LOCAL_ORIGIN = "http://localhost:3000";
const PUBLIC_ORIGIN = "https://api.example.com";
const TENANT_ID = "a".repeat(32);
const MOCK_TENANT_BASE: ITenant = {
	id: TENANT_ID,
	apiKey: "test-api-key",
	dateCreated: "2026-01-01T00:00:00.000Z",
	dateModified: "2026-01-01T00:00:00.000Z",
	label: "test-tenant"
};

describe("HostingService", () => {
	let mockTenantAdminComponent: ITenantAdminComponent;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantAdminComponent = {
			className: vi.fn().mockReturnValue("TenantAdminComponent"),
			get: vi.fn(),
			getByPublicOrigin: vi.fn()
		} as unknown as ITenantAdminComponent;

		vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({});
		vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(undefined);
	});

	describe("constructor", () => {
		test("throws when options is missing", () => {
			expect(() => new HostingService(undefined as never)).toThrow();
		});

		test("throws when options.config is missing", () => {
			expect(() => new HostingService({} as never)).toThrow();
		});

		test("throws when localOrigin is missing", () => {
			expect(() => new HostingService({ config: {} as never })).toThrow();
		});

		test("creates an instance with minimal config", () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			expect(service).toBeDefined();
		});

		test("creates an instance with full config", () => {
			const service = new HostingService({
				tenantAdminComponentType: "custom-tenant-admin",
				config: {
					localOrigin: LOCAL_ORIGIN,
					publicOrigin: PUBLIC_ORIGIN
				}
			});
			expect(service).toBeDefined();
		});
	});

	describe("className", () => {
		test("returns HostingService", () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			expect(service.className()).toBe("HostingService");
		});
	});

	describe("getPublicOrigin", () => {
		test("returns tenant public origin when tenant context is set and tenant has an origin", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
				[ContextIdKeys.Tenant]: TENANT_ID
			});
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				...MOCK_TENANT_BASE,
				publicOrigin: "https://tenant.example.com"
			});

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});

			await expect(service.getPublicOrigin()).resolves.toBe("https://tenant.example.com");
		});

		test("falls back to configured public origin when no tenant context", async () => {
			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});

			await expect(service.getPublicOrigin()).resolves.toBe(PUBLIC_ORIGIN);
		});

		test("falls back to server request origin when no public origin is configured", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue("http://request.example.com");

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });

			await expect(service.getPublicOrigin("http://request.example.com/api/v1")).resolves.toBe(
				"http://request.example.com"
			);
		});

		test("falls back to local origin as last resort", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });

			await expect(service.getPublicOrigin()).resolves.toBe(LOCAL_ORIGIN);
		});

		test("falls back to public origin when tenant has no public origin", async () => {
			vi.spyOn(ContextIdStore, "getContextIds").mockResolvedValue({
				[ContextIdKeys.Tenant]: TENANT_ID
			});
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({ ...MOCK_TENANT_BASE });

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});

			await expect(service.getPublicOrigin()).resolves.toBe(PUBLIC_ORIGIN);
		});
	});

	describe("getTenantOrigin", () => {
		test("throws when tenantId is not a 32-char hex string", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin("invalid")).rejects.toThrow();
		});

		test("returns undefined when no tenant admin component is registered", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBeUndefined();
		});

		test("returns the tenant public origin when the component and tenant exist", async () => {
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				...MOCK_TENANT_BASE,
				publicOrigin: "https://tenant.example.com"
			});

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBe("https://tenant.example.com");
			expect(mockTenantAdminComponent.get).toHaveBeenCalledWith(TENANT_ID);
		});

		test("returns undefined when tenant has no public origin", async () => {
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({ ...MOCK_TENANT_BASE });

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBeUndefined();
		});
	});

	describe("matchesLocalOrigin", () => {
		test("throws when url is missing", async () => {
			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.matchesLocalOrigin(undefined as never)).rejects.toThrow();
		});

		test("returns undefined when origin cannot be extracted from url", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue("");

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.matchesLocalOrigin("not-a-url")).resolves.toBeUndefined();
		});

		test("returns node when the url origin matches the configured public origin", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue(PUBLIC_ORIGIN);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await expect(service.matchesLocalOrigin(`${PUBLIC_ORIGIN}/some/path`)).resolves.toBe("node");
		});

		test("returns undefined when origin does not match public origin and no tenant admin component is registered", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue("https://unknown.example.com");

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});
			await expect(
				service.matchesLocalOrigin("https://unknown.example.com/path")
			).resolves.toBeUndefined();
		});

		test("returns the tenant id when the url origin matches a tenant public origin", async () => {
			const tenantOrigin = "https://tenant.example.com";
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue(tenantOrigin);
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.getByPublicOrigin).mockResolvedValue({
				...MOCK_TENANT_BASE,
				publicOrigin: tenantOrigin
			});

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.matchesLocalOrigin(`${tenantOrigin}/some/path`)).resolves.toBe(
				TENANT_ID
			);
			expect(mockTenantAdminComponent.getByPublicOrigin).toHaveBeenCalledWith(tenantOrigin);
		});

		test("returns undefined when tenant admin component is registered but origin is not found", async () => {
			vi.spyOn(HttpUrlHelper, "extractOrigin").mockReturnValue("https://unknown.example.com");
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.getByPublicOrigin).mockRejectedValue(
				new Error("Not found")
			);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(
				service.matchesLocalOrigin("https://unknown.example.com/path")
			).resolves.toBeUndefined();
		});
	});

	describe("buildPublicUrl", () => {
		test("replaces origin with configured public origin", async () => {
			vi.spyOn(HttpUrlHelper, "replaceOrigin").mockReturnValue(`${PUBLIC_ORIGIN}/some/path`);

			const service = new HostingService({
				config: { localOrigin: LOCAL_ORIGIN, publicOrigin: PUBLIC_ORIGIN }
			});

			await expect(service.buildPublicUrl(`${LOCAL_ORIGIN}/some/path`)).resolves.toBe(
				`${PUBLIC_ORIGIN}/some/path`
			);
			expect(HttpUrlHelper.replaceOrigin).toHaveBeenCalledWith(
				`${LOCAL_ORIGIN}/some/path`,
				PUBLIC_ORIGIN
			);
		});
	});
});
