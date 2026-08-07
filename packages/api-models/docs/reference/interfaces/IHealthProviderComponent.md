# Interface: IHealthProviderComponent

The health provider component for the server.

## Methods

### health()? {#health}

> `optional` **health**(): `Promise`\<[`IHealth`](IHealth.md)[]\>

Returns the health status of the component.

#### Returns

`Promise`\<[`IHealth`](IHealth.md)[]\>

The health status of the component, can return multiple entries for elements within the component.

***

### healthApplicationInit()? {#healthapplicationinit}

> `optional` **healthApplicationInit**(`contextIds`): `Promise`\<`void`\>

Initialize the application health processing for a component.

#### Parameters

##### contextIds

`IContextIds`

The context IDs provisioned during the init pass.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the initialization is complete.

***

### healthApplication()? {#healthapplication}

> `optional` **healthApplication**(`callback`): `Promise`\<[`IHealth`](IHealth.md)[] \| `undefined`\>

Returns the application health status of the component, context IDs from init are set in the current context.
Returns undefined when the result will be provided asynchronously via the callback.

#### Parameters

##### callback

[`HealthApplicationCallback`](../type-aliases/HealthApplicationCallback.md)

The callback to invoke when a deferred health result is ready.

#### Returns

`Promise`\<[`IHealth`](IHealth.md)[] \| `undefined`\>

The health status, or undefined if the result will be provided via the callback.

***

### healthApplicationTeardown()? {#healthapplicationteardown}

> `optional` **healthApplicationTeardown**(): `Promise`\<`void`\>

Teardown the application health processing for a component.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the teardown is complete.
