# Interface: IHealthProviderComponent

The health provider component for the server.

## Methods

### healthInit()? {#healthinit}

> `optional` **healthInit**(`lastTimestamp`, `contextIds`): `Promise`\<`void`\>

Initialize the health processing for a component.

#### Parameters

##### lastTimestamp

`number`

The Unix timestamp (ms) recorded at the start of the previous cycle.

##### contextIds

`IContextIds`

The context IDs provisioned during the init pass.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the initialization is complete.

***

### health()? {#health}

> `optional` **health**(`lastTimestamp`): `Promise`\<[`IHealth`](IHealth.md)[]\>

Returns the health status of the component, the context IDs from init are set in the current context.

#### Parameters

##### lastTimestamp

`number`

The Unix timestamp (ms) recorded at the start of the previous cycle.

#### Returns

`Promise`\<[`IHealth`](IHealth.md)[]\>

The health status of the component, can return multiple entries for elements within the component.

***

### healthTeardown()? {#healthteardown}

> `optional` **healthTeardown**(`lastTimestamp`): `Promise`\<`void`\>

Teardown the health processing for a component.

#### Parameters

##### lastTimestamp

`number`

The Unix timestamp (ms) recorded at the start of the previous cycle.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the teardown is complete.
