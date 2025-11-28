// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { TenantIdContextIdHandler } from "@twin.org/api-tenant-processor";
import {
	type BackgroundTask,
	BackgroundTaskService,
	initSchema as initSchemaBackgroundTask
} from "@twin.org/background-task-service";
import {
	ContextIdHandlerFactory,
	ContextIdKeys,
	ContextIdStore,
	type IContextIds
} from "@twin.org/context";
import { ComponentFactory, Converter, ObjectHelper, RandomHelper } from "@twin.org/core";
import { ComparisonOperator } from "@twin.org/entity";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { DidContextIdHandler } from "@twin.org/identity-models";
import type { IImmutableProof } from "@twin.org/immutable-proof-models";
import {
	type ImmutableProof,
	ImmutableProofService,
	initSchema as initSchemaImmutableProof
} from "@twin.org/immutable-proof-service";
import { ModuleHelper } from "@twin.org/modules";
import { nameof } from "@twin.org/nameof";
import {
	EntityStorageVerifiableStorageConnector,
	initSchema as initSchemaVerifiableStorage,
	type VerifiableItem
} from "@twin.org/verifiable-storage-connector-entity-storage";
import { VerifiableStorageConnectorFactory } from "@twin.org/verifiable-storage-models";
import {
	cleanupTestEnv,
	setupTestEnv,
	TEST_NODE_IDENTITY,
	TEST_ORGANIZATION_IDENTITY,
	TEST_TENANT_IDENTITY,
	TEST_TENANT_IDENTITY_SHORT,
	TEST_USER_IDENTITY
} from "./setupTestEnv.js";
import { AuditableItemStreamService } from "../src/auditableItemStreamService.js";
import type { AuditableItemStream } from "../src/entities/auditableItemStream.js";
import type { AuditableItemStreamEntry } from "../src/entities/auditableItemStreamEntry.js";
import { initSchema } from "../src/schema.js";

let streamStorage: MemoryEntityStorageConnector<AuditableItemStream>;
let streamEntryStorage: MemoryEntityStorageConnector<AuditableItemStreamEntry>;
let immutableProofStorage: MemoryEntityStorageConnector<ImmutableProof>;
let verifiableStorage: MemoryEntityStorageConnector<VerifiableItem>;
let backgroundTaskStorage: MemoryEntityStorageConnector<BackgroundTask>;

const FIRST_TICK = 1724327716271;
const SECOND_TICK = 1724327816272;

/**
 * Wait for the proof to be generated.
 * @param proofCount The number of proofs to wait for.
 */
async function waitForProofGeneration(proofCount: number = 1): Promise<void> {
	let count = 0;
	do {
		await new Promise(resolve => setTimeout(resolve, 200));
	} while (verifiableStorage.getStore().length < proofCount && count++ < proofCount * 40);
}

describe("AuditableItemStreamService", () => {
	beforeAll(async () => {
		await setupTestEnv();

		initSchema();
		initSchemaVerifiableStorage();
		initSchemaImmutableProof();
		initSchemaBackgroundTask();

		ContextIdHandlerFactory.register(ContextIdKeys.Node, () => new DidContextIdHandler());
		ContextIdHandlerFactory.register(ContextIdKeys.Tenant, () => new TenantIdContextIdHandler());
		ContextIdHandlerFactory.register(ContextIdKeys.Organization, () => new DidContextIdHandler());
		ContextIdHandlerFactory.register(ContextIdKeys.User, () => new DidContextIdHandler());

		ContextIdStore.getContextIds = vi.fn().mockImplementation(() => ({
			[ContextIdKeys.Node]: TEST_NODE_IDENTITY,
			[ContextIdKeys.Tenant]: TEST_TENANT_IDENTITY,
			[ContextIdKeys.Organization]: TEST_ORGANIZATION_IDENTITY,
			[ContextIdKeys.User]: TEST_USER_IDENTITY
		}));

		// Mock the module helper to execute the method in the same thread, so we don't have to create an engine
		ModuleHelper.execModuleMethodThreadMessage = vi
			.fn()
			.mockImplementation((module, completed) => ({
				executeMethod: async (method: string, args?: unknown, contextIds?: IContextIds) => {
					const res = await ModuleHelper.execModuleMethod(module, method, args as unknown[]);
					completed(method, res);
				}
			}));
	});

	afterAll(async () => {
		await cleanupTestEnv();
	});

	beforeEach(async () => {
		streamStorage = new MemoryEntityStorageConnector<AuditableItemStream>({
			entitySchema: nameof<AuditableItemStream>(),
			partitionContextIds: [ContextIdKeys.Tenant]
		});

		streamEntryStorage = new MemoryEntityStorageConnector<AuditableItemStreamEntry>({
			entitySchema: nameof<AuditableItemStreamEntry>(),
			partitionContextIds: [ContextIdKeys.Tenant]
		});

		EntityStorageConnectorFactory.register("auditable-item-stream", () => streamStorage);
		EntityStorageConnectorFactory.register("auditable-item-stream-entry", () => streamEntryStorage);

		verifiableStorage = new MemoryEntityStorageConnector<VerifiableItem>({
			entitySchema: nameof<VerifiableItem>(),
			partitionContextIds: [ContextIdKeys.Tenant]
		});
		EntityStorageConnectorFactory.register("verifiable-item", () => verifiableStorage);

		VerifiableStorageConnectorFactory.register(
			"verifiable-storage",
			() => new EntityStorageVerifiableStorageConnector()
		);

		immutableProofStorage = new MemoryEntityStorageConnector<ImmutableProof>({
			entitySchema: nameof<ImmutableProof>(),
			partitionContextIds: [ContextIdKeys.Tenant]
		});

		EntityStorageConnectorFactory.register("immutable-proof", () => immutableProofStorage);

		backgroundTaskStorage = new MemoryEntityStorageConnector<BackgroundTask>({
			entitySchema: nameof<BackgroundTask>()
		});
		EntityStorageConnectorFactory.register("background-task", () => backgroundTaskStorage);

		const backgroundTask = new BackgroundTaskService();
		ComponentFactory.register("background-task", () => backgroundTask);
		await backgroundTask.start();

		const immutableProofService = new ImmutableProofService();
		ComponentFactory.register("immutable-proof", () => immutableProofService);
		await immutableProofService.start();

		Date.now = vi
			.fn()
			.mockImplementationOnce(() => FIRST_TICK)
			.mockImplementationOnce(() => FIRST_TICK)
			.mockImplementation(() => SECOND_TICK);

		let idCounter = 1;
		RandomHelper.generate = vi
			.fn()
			.mockImplementation(length => new Uint8Array(length).fill(idCounter++));
	});

	test("Can create an instance of the service", async () => {
		const service = new AuditableItemStreamService();
		expect(service).toBeDefined();
	});

	test("Can create a stream with no data", async () => {
		const service = new AuditableItemStreamService();

		const streamId = await service.create({});

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:55:16.271Z",
				dateModified: "2024-08-22T11:55:16.271Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				immutableInterval: 10,
				indexCounter: 0,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore.length).toEqual(0);

		await waitForProofGeneration();

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0202020202020202020202020202020202020202020202020202020202020202",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"z2qPGJTdK1ByQ8tV3v8p8A96itMcPQ6LzXEXxhW1hxUTSMXqZhHDbRf9ZrSkTT3jroJv4Mbh16m4c4x2wAp1wJLgw",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:oW/cvYs4TpeixURbPDLMCqmwChgTSLcPp6zZ/acvloE=",
						proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101"
					})
				),
				id: "0505050505050505050505050505050505050505050505050505050505050505",
				maxAllowListSize: 100
			}
		]);

		const immutableProof = ObjectHelper.fromBytes<IImmutableProof>(
			Converter.base64ToBytes(verifiableStore[0].data)
		);
		expect(immutableProof).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/common/",
				"https://www.w3.org/ns/credentials/v2"
			],
			id: "0202020202020202020202020202020202020202020202020202020202020202",
			type: "ImmutableProof",
			proofObjectHash: "sha256:oW/cvYs4TpeixURbPDLMCqmwChgTSLcPp6zZ/acvloE=",
			proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:56:56.272Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"z2qPGJTdK1ByQ8tV3v8p8A96itMcPQ6LzXEXxhW1hxUTSMXqZhHDbRf9ZrSkTT3jroJv4Mbh16m4c4x2wAp1wJLgw",
				verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
			}
		});
	});

	test("Can create a stream with a single object and multiple entries", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 2,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();

		expect(entryStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 1"
				},
				proofId: "immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
				userIdentity: TEST_USER_IDENTITY,
				index: 0
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				id: "0707070707070707070707070707070707070707070707070707070707070707",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 2"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 1
			}
		]);

		await waitForProofGeneration(2);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0202020202020202020202020202020202020202020202020202020202020202",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
						proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101"
					})
				),
				id: "0909090909090909090909090909090909090909090909090909090909090909",
				maxAllowListSize: 100
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0505050505050505050505050505050505050505050505050505050505050505",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
						proofObjectId:
							"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404"
					})
				),
				id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
				maxAllowListSize: 100
			}
		]);

		const immutableProof = ObjectHelper.fromBytes<IImmutableProof>(
			Converter.base64ToBytes(verifiableStore[0].data)
		);
		expect(immutableProof).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/common/",
				"https://www.w3.org/ns/credentials/v2"
			],
			id: "0202020202020202020202020202020202020202020202020202020202020202",
			type: "ImmutableProof",
			proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
			proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:56:56.272Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
				verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
			}
		});

		const immutableProofEntry = ObjectHelper.fromBytes<IImmutableProof>(
			Converter.base64ToBytes(verifiableStore[1].data)
		);
		expect(immutableProofEntry).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/common/",
				"https://www.w3.org/ns/credentials/v2"
			],
			type: "ImmutableProof",
			proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
			proofObjectId:
				"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
			id: "0505050505050505050505050505050505050505050505050505050505050505",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:56:56.272Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
				verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
			}
		});
	});

	test("Can get a stream with a single object and multiple entries", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await waitForProofGeneration(2);

		const result = await service.get(streamId, {
			includeEntries: true,
			verifyStream: true,
			verifyEntries: true
		});

		expect(result).toEqual({
			"@context": [
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.org",
				"https://schema.twindev.org/immutable-proof/"
			],
			id: "ais:0101010101010101010101010101010101010101010101010101010101010101",
			type: "AuditableItemStream",
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateModified: "2024-08-22T11:56:56.272Z",
			entries: [
				{
					type: "AuditableItemStreamEntry",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
					dateCreated: "2024-08-22T11:56:56.272Z",
					proofId:
						"immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					},
					verification: {
						type: "ImmutableProofVerification",
						verified: true
					},
					index: 0,
					userIdentity: TEST_USER_IDENTITY
				},
				{
					type: "AuditableItemStreamEntry",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0707070707070707070707070707070707070707070707070707070707070707",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					},
					index: 1,
					userIdentity: TEST_USER_IDENTITY
				}
			],
			immutableInterval: 10,
			proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202",
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			verification: {
				type: "ImmutableProofVerification",
				verified: true
			},
			organizationIdentity: TEST_ORGANIZATION_IDENTITY,
			userIdentity: TEST_USER_IDENTITY
		});

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0202020202020202020202020202020202020202020202020202020202020202",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
						proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101"
					})
				),
				id: "0909090909090909090909090909090909090909090909090909090909090909",
				maxAllowListSize: 100
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0505050505050505050505050505050505050505050505050505050505050505",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
						proofObjectId:
							"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404"
					})
				),
				id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
				maxAllowListSize: 100
			}
		]);

		const immutableProof = ObjectHelper.fromBytes<IImmutableProof>(
			Converter.base64ToBytes(verifiableStore[0].data)
		);
		expect(immutableProof).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/common/",
				"https://www.w3.org/ns/credentials/v2"
			],
			id: "0202020202020202020202020202020202020202020202020202020202020202",
			type: "ImmutableProof",
			proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
			proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:56:56.272Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
				verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
			}
		});

		const immutableProofEntry = ObjectHelper.fromBytes<IImmutableProof>(
			Converter.base64ToBytes(verifiableStore[1].data)
		);
		expect(immutableProofEntry).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/common/",
				"https://www.w3.org/ns/credentials/v2"
			],
			type: "ImmutableProof",
			proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
			proofObjectId:
				"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
			id: "0505050505050505050505050505050505050505050505050505050505050505",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:56:56.272Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
				verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
			}
		});
	});

	test("Can get a stream with a single object and multiple entries, including entries", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await waitForProofGeneration(2);

		const result = await service.get(streamId, {
			includeEntries: true,
			verifyStream: true,
			verifyEntries: true
		});

		expect(result).toEqual({
			"@context": [
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.org",
				"https://schema.twindev.org/immutable-proof/"
			],
			id: "ais:0101010101010101010101010101010101010101010101010101010101010101",
			type: "AuditableItemStream",
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateModified: "2024-08-22T11:56:56.272Z",
			entries: [
				{
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
					type: "AuditableItemStreamEntry",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					},
					index: 0,
					verification: {
						type: "ImmutableProofVerification",
						verified: true
					},
					proofId:
						"immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
					userIdentity: TEST_USER_IDENTITY
				},
				{
					type: "AuditableItemStreamEntry",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0707070707070707070707070707070707070707070707070707070707070707",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					},
					index: 1,
					userIdentity: TEST_USER_IDENTITY
				}
			],
			immutableInterval: 10,
			proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202",
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			verification: {
				type: "ImmutableProofVerification",
				verified: true
			},
			organizationIdentity: TEST_ORGANIZATION_IDENTITY,
			userIdentity: TEST_USER_IDENTITY
		});
	});

	test("Can update a stream with a single object and multiple entries", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await service.update({
			id: streamId,
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note xxx"
			}
		});

		await waitForProofGeneration(2);

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note xxx"
				},
				immutableInterval: 10,
				indexCounter: 2,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				dateCreated: "2024-08-22T11:56:56.272Z",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 1"
				},
				proofId: "immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
				userIdentity: TEST_USER_IDENTITY,
				index: 0
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				id: "0707070707070707070707070707070707070707070707070707070707070707",
				dateCreated: "2024-08-22T11:56:56.272Z",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 2"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 1
			}
		]);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0202020202020202020202020202020202020202020202020202020202020202",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
						proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101"
					})
				),
				id: "0909090909090909090909090909090909090909090909090909090909090909",
				maxAllowListSize: 100
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0505050505050505050505050505050505050505050505050505050505050505",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
						proofObjectId:
							"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404"
					})
				),
				id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
				maxAllowListSize: 100
			}
		]);
	});

	test("Can add a stream entry to an existing stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await service.createEntry(streamId, {
			"@context": "https://www.w3.org/ns/activitystreams",
			"@type": "Note",
			content: "This is an entry note 3"
		});

		await waitForProofGeneration();

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 3,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		await waitForProofGeneration(2);

		const entryStore = streamEntryStorage.getStore();

		expect(entryStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 1"
				},
				proofId: "immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
				userIdentity: TEST_USER_IDENTITY,
				index: 0
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				id: "0707070707070707070707070707070707070707070707070707070707070707",
				dateCreated: "2024-08-22T11:56:56.272Z",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 2"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 1
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				id: "0808080808080808080808080808080808080808080808080808080808080808",
				dateCreated: "2024-08-22T11:56:56.272Z",
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 3"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 2
			}
		]);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0202020202020202020202020202020202020202020202020202020202020202",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zpUP89cJjeLv4TKSzcReUrgnoYPcMs5dFEgBTPbG48yqT7fJ7UJ1DBN1K7cUftDGdDUBUnD38du8VieZnTv9kLJo",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:5Onv4SDbuvNQB1B5wKuG9nVDuSzR8WSJXrsSnBtkYXs=",
						proofObjectId: "ais:0101010101010101010101010101010101010101010101010101010101010101"
					})
				),
				id: "0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a",
				maxAllowListSize: 100
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				allowList: [TEST_ORGANIZATION_IDENTITY],
				creator: TEST_ORGANIZATION_IDENTITY,
				data: Converter.bytesToBase64(
					ObjectHelper.toBytes({
						"@context": [
							"https://schema.twindev.org/immutable-proof/",
							"https://schema.twindev.org/common/",
							"https://www.w3.org/ns/credentials/v2"
						],
						id: "0505050505050505050505050505050505050505050505050505050505050505",
						type: "ImmutableProof",
						proof: {
							type: "DataIntegrityProof",
							created: "2024-08-22T11:56:56.272Z",
							cryptosuite: "eddsa-jcs-2022",
							proofPurpose: "assertionMethod",
							proofValue:
								"zVfSXEQ4XqCragZNNEnDRcLzACzGV22WPCscZn2rZpuKFcHV8Q1F3WWx1j9BGa1vyM29fhbqv1urhASXK6tmaMvm",
							verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
						},
						proofObjectHash: "sha256:tVgi9FOpuVLhzxYl3FDR/xPqvDcwJYUg3vf3sffc7Qw=",
						proofObjectId:
							"ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404"
					})
				),
				id: "0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
				maxAllowListSize: 100
			}
		]);
	});

	test("Can add multiple stream entries and expect more immutable checks", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		for (let i = 0; i < 10; i++) {
			await service.createEntry(streamId, {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: `This is an entry note ${i + 3}`
			});
		}

		await waitForProofGeneration(3);

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 12,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore).toHaveLength(12);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toHaveLength(3);
	});

	test("Can get an entry from the stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await new Promise(resolve => setTimeout(resolve, 1000));

		const stream = await service.get(streamId, {
			includeEntries: true,
			verifyStream: true,
			verifyEntries: true
		});

		const entry = await service.getEntry(streamId, stream.entries?.[0].id ?? "", {
			verifyEntry: true
		});

		expect(entry).toEqual({
			"@context": [
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.org",
				"https://schema.twindev.org/immutable-proof/"
			],
			type: "AuditableItemStreamEntry",
			id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			proofId: "immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
			userIdentity: TEST_USER_IDENTITY,
			index: 0,
			verification: {
				type: "ImmutableProofVerification",
				verified: true
			}
		});

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 2,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);
	});

	test("Can get an entry object from the stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		const stream = await service.get(streamId, {
			includeEntries: true,
			verifyStream: true,
			verifyEntries: true
		});

		const entry = await service.getEntryObject(streamId, stream.entries?.[0].id ?? "");

		expect(entry).toEqual({
			"@context": "https://www.w3.org/ns/activitystreams",
			"@type": "Note",
			content: "This is an entry note 1"
		});

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 2,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);
	});

	test("Can delete an entry from the stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		const stream = await service.get(streamId, { includeEntries: true });

		await service.removeEntry(streamId, stream.entries?.[0].id ?? "");

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 10,
				indexCounter: 2,
				proofId: "immutable-proof:0202020202020202020202020202020202020202020202020202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();

		expect(entryStore).toHaveLength(2);
		expect(entryStore[0].dateDeleted).toEqual("2024-08-22T11:56:56.272Z");

		const streamWithoutDeleted = await service.get(streamId, { includeEntries: true });
		expect(streamWithoutDeleted.entries).toHaveLength(1);

		const streamWithDeleted = await service.get(streamId, {
			includeEntries: true,
			includeDeleted: true
		});
		expect(streamWithDeleted.entries).toHaveLength(2);
	});

	test("Can delete the proof from a stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create(
			{
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				entries: [
					{
						entryObject: {
							"@context": "https://www.w3.org/ns/activitystreams",
							"@type": "Note",
							content: "This is an entry note 1"
						}
					},
					{
						entryObject: {
							"@context": "https://www.w3.org/ns/activitystreams",
							"@type": "Note",
							content: "This is an entry note 2"
						}
					}
				]
			},
			{
				immutableInterval: 1
			}
		);

		await service.removeVerifiable(streamId);

		expect(streamId.startsWith("ais:")).toEqual(true);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is a simple note"
				},
				immutableInterval: 1,
				indexCounter: 2
			}
		]);

		const streamEntryStore = streamEntryStorage.getStore();
		expect(streamEntryStore).toEqual([
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateDeleted: undefined,
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 1"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 0
			},
			{
				partitionId: TEST_TENANT_IDENTITY_SHORT,
				id: "0707070707070707070707070707070707070707070707070707070707070707",
				streamId: "0101010101010101010101010101010101010101010101010101010101010101",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateDeleted: undefined,
				entryObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: "This is an entry note 2"
				},
				userIdentity: TEST_USER_IDENTITY,
				index: 1
			}
		]);
	});

	test("Can delete a stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await service.remove(streamId);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toEqual([]);

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore).toEqual([]);
	});

	test("Can get entries from a stream", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await waitForProofGeneration(2);

		await service.get(streamId, { includeEntries: true });

		const entries = await service.getEntries(streamId, { verifyEntries: true });

		expect(entries).toEqual({
			"@context": [
				"https://schema.org",
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.twindev.org/immutable-proof/"
			],
			type: ["ItemList", "AuditableItemStreamEntryList"],
			itemListElement: [
				{
					type: "AuditableItemStreamEntry",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0404040404040404040404040404040404040404040404040404040404040404",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					},
					proofId:
						"immutable-proof:0505050505050505050505050505050505050505050505050505050505050505",
					verification: {
						type: "ImmutableProofVerification",
						verified: true
					},
					index: 0,
					userIdentity: TEST_USER_IDENTITY
				},
				{
					type: "AuditableItemStreamEntry",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					},
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0707070707070707070707070707070707070707070707070707070707070707",
					index: 1,
					userIdentity: TEST_USER_IDENTITY
				}
			]
		});
	});

	test("Can get entries from a stream using sub object", async () => {
		const service = new AuditableItemStreamService();
		const streamId = await service.create({
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			entries: [
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					}
				},
				{
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					}
				}
			]
		});

		await service.get(streamId, { includeEntries: true });

		const entries = await service.getEntries(streamId, {
			verifyEntries: true,
			conditions: [
				{
					property: "entryObject.@type",
					comparison: ComparisonOperator.Equals,
					value: "Note"
				},
				{
					property: "entryObject.content",
					comparison: ComparisonOperator.Equals,
					value: "This is an entry note 2"
				}
			]
		});

		expect(entries).toEqual({
			"@context": [
				"https://schema.org",
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.twindev.org/immutable-proof/"
			],
			type: ["ItemList", "AuditableItemStreamEntryList"],
			itemListElement: [
				{
					type: "AuditableItemStreamEntry",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101:0707070707070707070707070707070707070707070707070707070707070707",
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 2"
					},
					index: 1,
					userIdentity: TEST_USER_IDENTITY
				}
			]
		});
	});

	test("Can query a list of streams", async () => {
		const service = new AuditableItemStreamService();

		for (let i = 0; i < 5; i++) {
			await service.create({
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: `This is a simple note ${i + 1}`
				},
				entries: [
					{
						entryObject: {
							"@context": "https://www.w3.org/ns/activitystreams",
							"@type": "Note",
							content: "This is an entry note 1"
						}
					},
					{
						entryObject: {
							"@context": "https://www.w3.org/ns/activitystreams",
							"@type": "Note",
							content: "This is an entry note 2"
						}
					}
				]
			});
		}

		const result = await service.query();
		expect(result).toEqual({
			"@context": [
				"https://schema.org",
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/"
			],
			type: ["ItemList", "AuditableItemStreamList"],
			itemListElement: [
				{
					type: "AuditableItemStream",
					id: "ais:0101010101010101010101010101010101010101010101010101010101010101",
					dateCreated: "2024-08-22T11:56:56.272Z",
					dateModified: "2024-08-22T11:56:56.272Z",
					annotationObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is a simple note 1"
					}
				},
				{
					type: "AuditableItemStream",
					id: "ais:0808080808080808080808080808080808080808080808080808080808080808",
					dateCreated: "2024-08-22T11:56:56.272Z",
					dateModified: "2024-08-22T11:56:56.272Z",
					annotationObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is a simple note 2"
					}
				},
				{
					type: "AuditableItemStream",
					id: "ais:0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
					dateCreated: "2024-08-22T11:56:56.272Z",
					dateModified: "2024-08-22T11:56:56.272Z",
					annotationObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is a simple note 3"
					}
				},
				{
					type: "AuditableItemStream",
					id: "ais:1616161616161616161616161616161616161616161616161616161616161616",
					dateCreated: "2024-08-22T11:56:56.272Z",
					dateModified: "2024-08-22T11:56:56.272Z",
					annotationObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is a simple note 4"
					}
				},
				{
					type: "AuditableItemStream",
					id: "ais:1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d",
					dateCreated: "2024-08-22T11:56:56.272Z",
					dateModified: "2024-08-22T11:56:56.272Z",
					annotationObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is a simple note 5"
					}
				}
			]
		});
	});
});
