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

/**
 * Expect the immutable proof to have the correct structure and values.
 * @param immutableProof The proof to check.
 * @param created The expected created value of the proof.
 */
function expectImmutableProof(immutableProof: IImmutableProof, created: string): void {
	expect(immutableProof).toMatchObject({
		"@context": "https://w3id.org/security/data-integrity/v2",
		type: "DataIntegrityProof",
		created,
		cryptosuite: "eddsa-jcs-2022",
		proofPurpose: "assertionMethod",
		verificationMethod: `${TEST_ORGANIZATION_IDENTITY}#immutable-proof-assertion`
	});

	const proofValue = (immutableProof as unknown as { proofValue?: unknown }).proofValue;
	expect(typeof proofValue).toBe("string");
	expect((proofValue as string).length).toBeGreaterThan(0);
	// base58btc encoded values typically start with 'z'
	expect(proofValue as string).toMatch(/^z[1-9A-HJ-NP-Za-km-z]+$/);
}

/**
 * Decode the immutable proof from the verifiable item.
 * @param item The verifiable item containing the proof.
 * @returns The decoded immutable proof.
 */
function decodeImmutableProofFromVerifiableItem(item: VerifiableItem): IImmutableProof {
	return ObjectHelper.fromBytes<IImmutableProof>(Converter.base64ToBytes(item.data));
}

/**
 * Get the stream entity id from the stream id.
 * @param streamId The stream id.
 * @returns The stream entity id.
 */
function getStreamEntityId(streamId: string): string {
	return streamId.startsWith("ais:") ? streamId.slice("ais:".length) : streamId;
}

/**
 * Get the entry id from the stream id and entry entity id.
 * @param streamId The stream id.
 * @param entryEntityId The entry entity id.
 * @returns The entry id.
 */
function getEntryId(streamId: string, entryEntityId: string): string {
	return `${streamId}:${entryEntityId}`;
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
				id: "019179f0e5af71018101010101010101",
				dateCreated: "2024-08-22T11:55:16.271Z",
				dateModified: "2024-08-22T11:55:16.271Z",
				organizationIdentity: TEST_ORGANIZATION_IDENTITY,
				userIdentity: TEST_USER_IDENTITY,
				immutableInterval: 10,
				indexCounter: 0,
				proofId: "immutable-proof:019179f26c5072028202020202020202"
			}
		]);

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore.length).toEqual(0);

		await waitForProofGeneration();

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toHaveLength(1);
		expect(verifiableStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0505050505050505050505050505050505050505050505050505050505050505",
			maxAllowListSize: 100
		});
		expect(typeof verifiableStore[0].data).toBe("string");

		const immutableProof = decodeImmutableProofFromVerifiableItem(verifiableStore[0]);
		expectImmutableProof(immutableProof, "2024-08-22T11:56:56.272Z");
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
		const streamEntityId = getStreamEntityId(streamId);

		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});

		const entryStore = streamEntryStorage.getStore();

		expect(entryStore).toHaveLength(2);
		expect(entryStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			proofId: "immutable-proof:019179f26c5075058505050505050505",
			userIdentity: TEST_USER_IDENTITY,
			index: 0
		});
		expect(entryStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 2"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 1
		});
		expect(entryStore[0].id).not.toEqual(entryStore[1].id);

		await waitForProofGeneration(2);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toHaveLength(2);
		expect(verifiableStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0909090909090909090909090909090909090909090909090909090909090909",
			maxAllowListSize: 100
		});
		expect(verifiableStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
			maxAllowListSize: 100
		});

		const immutableProof = decodeImmutableProofFromVerifiableItem(verifiableStore[0]);
		expectImmutableProof(immutableProof, "2024-08-22T11:56:56.272Z");

		const immutableProofEntry = decodeImmutableProofFromVerifiableItem(verifiableStore[1]);
		expectImmutableProof(immutableProofEntry, "2024-08-22T11:56:56.272Z");
	});

	test("Can create a stream with a single object and multiple entries with no immutability", async () => {
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
				immutableInterval: 0
			}
		);

		expect(streamId.startsWith("ais:")).toEqual(true);
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateModified: "2024-08-22T11:56:56.272Z",
			organizationIdentity: TEST_ORGANIZATION_IDENTITY,
			userIdentity: TEST_USER_IDENTITY,
			annotationObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is a simple note"
			},
			immutableInterval: 0,
			indexCounter: 2
		});

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore).toHaveLength(2);
		expect(entryStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 0
		});
		expect(entryStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 2"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 1
		});
		expect(entryStore[0].id).not.toEqual(entryStore[1].id);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toEqual([]);
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
		const entryStore = streamEntryStorage.getStore();
		const entryId0 = entryStore[0]?.id;
		const entryId1 = entryStore[1]?.id;

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
			id: streamId,
			type: "AuditableItemStream",
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateModified: "2024-08-22T11:56:56.272Z",
			entries: [
				{
					type: "AuditableItemStreamEntry",
					id: getEntryId(streamId, entryId0),
					dateCreated: "2024-08-22T11:56:56.272Z",
					proofId: "immutable-proof:019179f26c5075058505050505050505",
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
					id: getEntryId(streamId, entryId1),
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
			proofId: "immutable-proof:019179f26c5072028202020202020202",
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
		expect(verifiableStore).toHaveLength(2);
		expect(verifiableStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0909090909090909090909090909090909090909090909090909090909090909",
			maxAllowListSize: 100
		});
		expect(verifiableStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
			maxAllowListSize: 100
		});

		const immutableProof = decodeImmutableProofFromVerifiableItem(verifiableStore[0]);
		expectImmutableProof(immutableProof, "2024-08-22T11:56:56.272Z");

		const immutableProofEntry = decodeImmutableProofFromVerifiableItem(verifiableStore[1]);
		expectImmutableProof(immutableProofEntry, "2024-08-22T11:56:56.272Z");
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

		const entryStore = streamEntryStorage.getStore();
		const entryId0 = entryStore[0]?.id;
		const entryId1 = entryStore[1]?.id;

		expect(result).toEqual({
			"@context": [
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.org",
				"https://schema.twindev.org/immutable-proof/"
			],
			id: streamId,
			type: "AuditableItemStream",
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateModified: "2024-08-22T11:56:56.272Z",
			entries: [
				{
					id: getEntryId(streamId, entryId0),
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
					proofId: "immutable-proof:019179f26c5075058505050505050505",
					userIdentity: TEST_USER_IDENTITY
				},
				{
					type: "AuditableItemStreamEntry",
					id: getEntryId(streamId, entryId1),
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
			proofId: "immutable-proof:019179f26c5072028202020202020202",
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
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});

		const entryStore = streamEntryStorage.getStore();
		expect(entryStore).toHaveLength(2);
		expect(entryStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			proofId: "immutable-proof:019179f26c5075058505050505050505",
			userIdentity: TEST_USER_IDENTITY,
			index: 0
		});
		expect(entryStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 2"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 1
		});
		expect(entryStore[0].id).not.toEqual(entryStore[1].id);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toHaveLength(2);
		expect(verifiableStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0909090909090909090909090909090909090909090909090909090909090909",
			maxAllowListSize: 100
		});
		expect(verifiableStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
			maxAllowListSize: 100
		});
		expectImmutableProof(
			decodeImmutableProofFromVerifiableItem(verifiableStore[0]),
			"2024-08-22T11:56:56.272Z"
		);
		expectImmutableProof(
			decodeImmutableProofFromVerifiableItem(verifiableStore[1]),
			"2024-08-22T11:56:56.272Z"
		);
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
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});

		await waitForProofGeneration(2);

		const entryStore = streamEntryStorage.getStore();

		expect(entryStore).toHaveLength(3);
		expect(entryStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			proofId: "immutable-proof:019179f26c5075058505050505050505",
			userIdentity: TEST_USER_IDENTITY,
			index: 0
		});
		expect(entryStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 2"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 1
		});
		expect(entryStore[2]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 3"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 2
		});
		expect(entryStore[0].id).not.toEqual(entryStore[1].id);
		expect(entryStore[1].id).not.toEqual(entryStore[2].id);

		const verifiableStore = verifiableStorage.getStore();
		expect(verifiableStore).toHaveLength(2);
		expect(verifiableStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a",
			maxAllowListSize: 100
		});
		expect(verifiableStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			allowList: [TEST_ORGANIZATION_IDENTITY],
			creator: TEST_ORGANIZATION_IDENTITY,
			id: "0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c",
			maxAllowListSize: 100
		});
		expectImmutableProof(
			decodeImmutableProofFromVerifiableItem(verifiableStore[0]),
			"2024-08-22T11:56:56.272Z"
		);
		expectImmutableProof(
			decodeImmutableProofFromVerifiableItem(verifiableStore[1]),
			"2024-08-22T11:56:56.272Z"
		);
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
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();

		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});

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
		const streamEntityId = getStreamEntityId(streamId);
		const entryId = stream.entries?.[0].id;

		expect(entry).toEqual({
			"@context": [
				"https://schema.twindev.org/ais/",
				"https://schema.twindev.org/common/",
				"https://schema.org",
				"https://schema.twindev.org/immutable-proof/"
			],
			type: "AuditableItemStreamEntry",
			id: entryId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			proofId: stream.entries?.[0].proofId,
			userIdentity: TEST_USER_IDENTITY,
			index: 0,
			verification: {
				type: "ImmutableProofVerification",
				verified: true
			}
		});

		const streamStore = streamStorage.getStore();
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});
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
		const streamEntityId = getStreamEntityId(streamId);
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});
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
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
			proofId: "immutable-proof:019179f26c5072028202020202020202"
		});

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
		const streamEntityId = getStreamEntityId(streamId);

		const streamStore = streamStorage.getStore();
		expect(streamStore).toHaveLength(1);
		expect(streamStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			id: streamEntityId,
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
		});

		const streamEntryStore = streamEntryStorage.getStore();
		expect(streamEntryStore).toHaveLength(2);
		expect(streamEntryStore[0]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateDeleted: undefined,
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 1"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 0
		});
		expect(streamEntryStore[1]).toMatchObject({
			partitionId: TEST_TENANT_IDENTITY_SHORT,
			streamId: streamEntityId,
			dateCreated: "2024-08-22T11:56:56.272Z",
			dateDeleted: undefined,
			entryObject: {
				"@context": "https://www.w3.org/ns/activitystreams",
				"@type": "Note",
				content: "This is an entry note 2"
			},
			userIdentity: TEST_USER_IDENTITY,
			index: 1
		});
		expect((streamEntryStore[0] as { proofId?: unknown }).proofId).toBeUndefined();
		expect((streamEntryStore[1] as { proofId?: unknown }).proofId).toBeUndefined();
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

		const entriesAndCursor = await service.getEntries(streamId, { verifyEntries: true });
		const entryStore = streamEntryStorage.getStore();

		expect(entriesAndCursor.entries).toEqual({
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
					id: getEntryId(streamId, entryStore[0].id),
					dateCreated: "2024-08-22T11:56:56.272Z",
					entryObject: {
						"@context": "https://www.w3.org/ns/activitystreams",
						"@type": "Note",
						content: "This is an entry note 1"
					},
					proofId: "immutable-proof:019179f26c5075058505050505050505",
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
					id: getEntryId(streamId, entryStore[1].id),
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

		const entriesAndCursor = await service.getEntries(streamId, {
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
		const entryStore = streamEntryStorage.getStore();

		expect(entriesAndCursor.entries).toEqual({
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
					id: getEntryId(streamId, entryStore[1].id),
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

		const resultAndCursor = await service.query();
		expect(resultAndCursor.entries["@context"]).toEqual([
			"https://schema.org",
			"https://schema.twindev.org/ais/",
			"https://schema.twindev.org/common/"
		]);
		expect(resultAndCursor.entries.type).toEqual(["ItemList", "AuditableItemStreamList"]);
		expect(resultAndCursor.entries.itemListElement).toHaveLength(5);

		for (let i = 0; i < 5; i++) {
			expect(resultAndCursor.entries.itemListElement[i]).toMatchObject({
				type: "AuditableItemStream",
				dateCreated: "2024-08-22T11:56:56.272Z",
				dateModified: "2024-08-22T11:56:56.272Z",
				annotationObject: {
					"@context": "https://www.w3.org/ns/activitystreams",
					"@type": "Note",
					content: `This is a simple note ${i + 1}`
				}
			});
			expect(resultAndCursor.entries.itemListElement[i].id.startsWith("ais:")).toEqual(true);
		}
	});
});
