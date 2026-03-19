# Interface: IHttpRequestContext

Context data from the HTTP request.

## Extended by

- [`ISocketRequestContext`](ISocketRequestContext.md)

## Properties

### serverRequest {#serverrequest}

> **serverRequest**: [`IHttpServerRequest`](IHttpServerRequest.md)

The raw HTTP request.

***

### processorState {#processorstate}

> **processorState**: `object`

The state handed through the processors.

#### Index Signature

\[`id`: `string`\]: `unknown`

***

### loggingComponentType? {#loggingcomponenttype}

> `optional` **loggingComponentType?**: `string`

Logging component type for the request.

***

### hostingComponentType? {#hostingcomponenttype}

> `optional` **hostingComponentType?**: `string`

Hosting component type for the request.
