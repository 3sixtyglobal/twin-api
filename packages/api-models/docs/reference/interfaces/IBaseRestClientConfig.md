# Interface: IBaseRestClientConfig

Definition for the configuration of a rest client.

## Properties

### endpoint {#endpoint}

> **endpoint**: `string`

The endpoint where the api is hosted.

***

### pathPrefix? {#pathprefix}

> `optional` **pathPrefix?**: `string`

The prefix to the routes.

***

### headers? {#headers}

> `optional` **headers?**: `IHttpHeaders`

The headers to include in requests.

***

### timeout? {#timeout}

> `optional` **timeout?**: `number`

Timeout for requests in ms.

***

### includeCredentials? {#includecredentials}

> `optional` **includeCredentials?**: `boolean`

Include credentials in the request, defaults to true.

***

### processorTypes? {#processortypes}

> `optional` **processorTypes?**: `string`[]

The types of the processors to run around each request, resolved from the `RestClientProcessorFactory`.

***

### customHeaders? {#customheaders}

> `optional` **customHeaders?**: () => `Promise`\<`IHttpHeaders`\>

Hook to provide headers asynchronously.

#### Returns

`Promise`\<`IHttpHeaders`\>

A promise that resolves to the headers.

***

### customAuthHeader? {#customauthheader}

> `optional` **customAuthHeader?**: () => `Promise`\<`string`\>

Hook to provide an authorization header value asynchronously.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the authorization header value.

***

### onAuthFailure? {#onauthfailure}

> `optional` **onAuthFailure?**: (`err`) => `Promise`\<`void`\>

Hook to handle authorization failures asynchronously.

#### Parameters

##### err

`IError`

#### Returns

`Promise`\<`void`\>

A promise that resolves when the auth failure handling is complete.
