// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { TenantIdHelper } from "../../src/utils/tenantIdHelper.js";

describe("TenantIdHelper", () => {
	it("should generate a valid tenant ID", () => {
		const tenantId = TenantIdHelper.generateTenantId();
		expect(tenantId).toMatch(/^[\da-f]{32}$/);
	});

	it("should generate a valid API key", () => {
		const apiKey = TenantIdHelper.generateApiKey();
		expect(apiKey).toMatch(/^[\da-f]{32}$/);
	});
});
