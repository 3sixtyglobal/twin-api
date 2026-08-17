# Interface: IRestClientProcessor

A processor that participates in an outbound REST request.

## Extends

- `IComponent`

## Methods

### pre()? {#pre}

> `optional` **pre**(`context`, `next`): `Promise`\<`Response`\>

Run the processor before the fetch takes place.

#### Parameters

##### context

[`IRestClientProcessorContext`](IRestClientProcessorContext.md)

The details of the request being made.

##### next

() => `Promise`\<`Response`\>

Performs the request, or calls the next processor in the chain.

#### Returns

`Promise`\<`Response`\>

The result of next.

***

### post()? {#post}

> `optional` **post**(`context`, `response`, `next`): `Promise`\<`Response`\>

Run the processor after the fetch completes.

#### Parameters

##### context

[`IRestClientProcessorContext`](IRestClientProcessorContext.md)

The details of the request that was made.

##### response

`Response`

The response from the request.

##### next

() => `Promise`\<`Response`\>

Performs the post processing, or calls the next processor in the chain.

#### Returns

`Promise`\<`Response`\>

The result of next.
