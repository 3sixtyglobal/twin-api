// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IValidationFailure } from "@twin.org/core";
import { DataTypeHelper } from "@twin.org/data-core";
import { JsonLdDataTypes } from "@twin.org/data-json-ld";
import { AuditableItemStreamDataTypes } from "../../src/dataTypes/auditableItemStreamDataTypes.js";
import { AuditableItemStreamContexts } from "../../src/models/auditableItemStreamContexts.js";
import { AuditableItemStreamTypes } from "../../src/models/auditableItemStreamTypes.js";

describe("AuditableItemStreamDataTypes", () => {
	beforeAll(async () => {
		JsonLdDataTypes.registerTypes();
		AuditableItemStreamDataTypes.registerTypes();
	});

	test("Can fail to validate an empty stream", async () => {
		const validationFailures: IValidationFailure[] = [];
		const isValid = await DataTypeHelper.validate(
			"",
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.Stream}`,
			{
				id: "foo",
				dateCreated: new Date().toISOString(),
				immutableInterval: 10,
				organizationIdentity: "org"
			},
			validationFailures
		);
		expect(validationFailures.length).toEqual(1);
		expect(isValid).toEqual(false);
	});

	test("Can validate an empty stream", async () => {
		const validationFailures: IValidationFailure[] = [];
		const isValid = await DataTypeHelper.validate(
			"",
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.Stream}`,
			{
				"@context": [
					AuditableItemStreamContexts.Namespace,
					AuditableItemStreamContexts.NamespaceCommon
				],
				type: AuditableItemStreamTypes.Stream,
				id: "foo",
				dateCreated: new Date().toISOString(),
				immutableInterval: 10,
				organizationIdentity: "org",
				proofId: "1111",
				numberOfItems: 0
			},
			validationFailures
		);
		expect(validationFailures.length).toEqual(0);
		expect(isValid).toEqual(true);
	});
});
