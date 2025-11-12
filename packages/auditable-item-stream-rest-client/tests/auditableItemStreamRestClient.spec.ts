// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { AuditableItemStreamRestClient } from "../src/auditableItemStreamRestClient.js";

describe("AuditableItemStreamRestClient", () => {
	test("Can create an instance", async () => {
		const client = new AuditableItemStreamRestClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
