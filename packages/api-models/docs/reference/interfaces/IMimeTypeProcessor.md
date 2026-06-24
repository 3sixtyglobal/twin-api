# Interface: IMimeTypeProcessor

The definition for a handler for a specific MIME type.

## Extends

- `IComponent`

## Methods

### getTypes() {#gettypes}

> **getTypes**(): `string`[]

Get the MIME types that this handler can handle.

#### Returns

`string`[]

The MIME types that this handler can handle.

***

### handle() {#handle}

> **handle**(`body`): `Promise`\<`unknown`\>

Handle content.

#### Parameters

##### body

`Uint8Array`

The body to process.

#### Returns

`Promise`\<`unknown`\>

The processed body.
