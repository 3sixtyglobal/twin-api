# Interface: IMimeTypeProcessor

The definition for a handler for a specific MIME type.

## Extends

- `IComponent`

## Indexable

\[`key`: `string`\]: `any`

All methods are optional, so we introduce an index signature to allow
any additional properties or methods, which removes the TypeScript error where
the class has no properties in common with the type.

## Methods

### getTypes()

> **getTypes**(): `string`[]

Get the MIME types that this handler can handle.

#### Returns

`string`[]

The MIME types that this handler can handle.

***

### handle()

> **handle**(`body`): `Promise`\<`unknown`\>

Handle content.

#### Parameters

##### body

`Uint8Array`

The body to process.

#### Returns

`Promise`\<`unknown`\>

The processed body.
