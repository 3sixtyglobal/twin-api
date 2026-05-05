// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpUrlHelper, type ITenantAdminComponent } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory } from "@twin.org/core";
import { HostingService } from "../src/hostingService.js";

const LOCAL_ORIGIN = "http://localhost:3000";
const PUBLIC_ORIGIN = "https://api.example.com";
const TENANT_ID = "a".repeat(32);

describe("HostingService", () => {
	let mockTenantAdminComponent: ITenantAdminComponent;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockTenantAdminComponent = {
			className: vi.fn().mockReturnValue("TenantAdminComponent"),
			get: vi.fn()
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
				publicOrigin: "https://tenant.example.com"
			} as never);

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
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: undefined
			} as never);

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
				publicOrigin: "https://tenant.example.com"
			} as never);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBe("https://tenant.example.com");
			expect(mockTenantAdminComponent.get).toHaveBeenCalledWith(TENANT_ID);
		});

		test("returns undefined when tenant has no public origin", async () => {
			vi.spyOn(ComponentFactory, "getIfExists").mockReturnValue(mockTenantAdminComponent);
			vi.mocked(mockTenantAdminComponent.get).mockResolvedValue({
				publicOrigin: undefined
			} as never);

			const service = new HostingService({ config: { localOrigin: LOCAL_ORIGIN } });
			await expect(service.getTenantOrigin(TENANT_ID)).resolves.toBeUndefined();
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
