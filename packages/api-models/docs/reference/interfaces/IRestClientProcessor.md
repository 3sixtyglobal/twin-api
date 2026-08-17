# Interface: IRestClientProcessor

A processor that participates in an outbound REST request.

## Extends

- `IComponent`

## Methods

### wrap() {#wrap}

> **wrap**\<`T`\>(`context`, `next`): `Promise`\<`T`\>

Wrap an outbound request.

#### Type Parameters

##### T

`T`

#### Parameters

##### context

The details of the request being made.

###### implementationName

`string`

The name of the client making the request.

###### route

`string`

The route being requested.

###### method

`HttpMethod`

The http method of the request.

###### headers

`IHttpHeaders`

The headers being sent.

##### next

() => `Promise`\<`T`\>

Performs the request, or calls the next processor in the chain.

#### Returns

`Promise`\<`T`\>

The result of next.
