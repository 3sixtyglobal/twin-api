# Interface: ISocketRequestContext

Context data from the socket request.

## Extends

- [`IHttpRequestContext`](IHttpRequestContext.md)

## Properties

### serverRequest {#serverrequest}

> **serverRequest**: [`IHttpServerRequest`](IHttpServerRequest.md)

The raw HTTP request.

#### Inherited from

[`IHttpRequestContext`](IHttpRequestContext.md).[`serverRequest`](IHttpRequestContext.md#serverrequest)

***

### processorState {#processorstate}

> **processorState**: `object`

The state handed through the processors.

#### Index Signature

\[`id`: `string`\]: `unknown`

#### Inherited from

[`IHttpRequestContext`](IHttpRequestContext.md).[`processorState`](IHttpRequestContext.md#processorstate)

***

### loggingComponentType? {#loggingcomponenttype}

> `optional` **loggingComponentType?**: `string`

Logging component type for the request.

#### Inherited from

[`IHttpRequestContext`](IHttpRequestContext.md).[`loggingComponentType`](IHttpRequestContext.md#loggingcomponenttype)

***

### socketId {#socketid}

> **socketId**: `string`

The id of the socket.
