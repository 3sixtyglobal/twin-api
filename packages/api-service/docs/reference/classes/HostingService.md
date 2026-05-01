# Class: HostingService

The hosting service for the server.

## Implements

- `IHostingComponent`

## Constructors

### Constructor

> **new HostingService**(`options`): `HostingService`

Create a new instance of HostingService.

#### Parameters

##### options

[`IHostingServiceConstructorOptions`](../interfaces/IHostingServiceConstructorOptions.md)

The options to create the service.

#### Returns

`HostingService`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IHostingComponent.className`

***

### start() {#start}

> **start**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be started when the node is initialized.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IHostingComponent.start`

***

### getPublicOrigin() {#getpublicorigin}

> **getPublicOrigin**(`serverRequestUrl?`): `Promise`\<`string`\>

Get the public origin for the hosting.

#### Parameters

##### serverRequestUrl?

`string`

The url of the current server request if there is one.

#### Returns

`Promise`\<`string`\>

The public origin.

#### Implementation of

`IHostingComponent.getPublicOrigin`

***

### getTenantOrigin() {#gettenantorigin}

> **getTenantOrigin**(`tenantId`): `Promise`\<`string` \| `undefined`\>

Get the public origin for the tenant if one exists.

#### Parameters

##### tenantId

`string`

The tenant identifier.

#### Returns

`Promise`\<`string` \| `undefined`\>

The public origin for the tenant.

#### Implementation of

`IHostingComponent.getTenantOrigin`

***

### buildPublicUrl() {#buildpublicurl}

> **buildPublicUrl**(`url`): `Promise`\<`string`\>

Build a public url based on the public origin and the url provided.

#### Parameters

##### url

`string`

The url to build upon the public origin.

#### Returns

`Promise`\<`string`\>

The full url based on the public origin.

#### Implementation of

`IHostingComponent.buildPublicUrl`

***

### addEncryptedParamsToUrl() {#addencryptedparamstourl}

> **addEncryptedParamsToUrl**(`url`, `params`): `Promise`\<`string`\>

Add encrypted key/value pairs to a URL's query string.
Existing query parameters on the URL are preserved; the provided params are
merged in and then encrypted before being written back to the URL.

#### Parameters

##### url

`string`

The base URL to add parameters to.

##### params

`IHttpRequestQuery`

The key/value pairs to encrypt and append.

#### Returns

`Promise`\<`string`\>

The URL with the encrypted parameters added.

#### Implementation of

`IHostingComponent.addEncryptedParamsToUrl`

***

### getDecryptedParamsFromQueryParams() {#getdecryptedparamsfromqueryparams}

> **getDecryptedParamsFromQueryParams**(`queryParams`, `keys`): `Promise`\<`IHttpRequestQuery`\>

Decrypt specified keys from a query parameter object and return their plain-text values.

#### Parameters

##### queryParams

`IHttpRequestQuery` \| `undefined`

The HTTP request query containing the encrypted parameters.

##### keys

`string`[]

The keys to decrypt.

#### Returns

`Promise`\<`IHttpRequestQuery`\>

A map of the decrypted key/value pairs that were present.

#### Implementation of

`IHostingComponent.getDecryptedParamsFromQueryParams`

***

### addTenantTokenToUrl() {#addtenanttokentourl}

> **addTenantTokenToUrl**(`url`, `tenantId`): `Promise`\<`string`\>

Encrypt the tenant id and append it as a query parameter to the given URL.

#### Parameters

##### url

`string`

The URL to append the encrypted tenant token to.

##### tenantId

`string`

The tenant identifier to encrypt and add.

#### Returns

`Promise`\<`string`\>

The URL with the encrypted tenant token added as a query parameter.

#### Implementation of

`IHostingComponent.addTenantTokenToUrl`

***

### getTenantTokenFromQueryParams() {#gettenanttokenfromqueryparams}

> **getTenantTokenFromQueryParams**(`queryParams`): `Promise`\<`string` \| `undefined`\>

Get the tenant token from the query parameters.

#### Parameters

##### queryParams

`IHttpRequestQuery` \| `undefined`

The HTTP request query containing the parameters.

#### Returns

`Promise`\<`string` \| `undefined`\>

The tenant token if it exists.

#### Implementation of

`IHostingComponent.getTenantTokenFromQueryParams`

***

### encryptQueryParams() {#encryptqueryparams}

> **encryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Encrypt query parameters using the hosting component's encryption mechanism.

#### Parameters

##### httpRequestQuery

`IHttpRequestQuery` \| `undefined`

The HTTP request query containing the parameters to encrypt.

##### keys

`string`[]

The keys of the parameters to encrypt.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the query parameters have been encrypted.

#### Implementation of

`IHostingComponent.encryptQueryParams`

***

### decryptQueryParams() {#decryptqueryparams}

> **decryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Decrypt query parameters using the hosting component's encryption mechanism.

#### Parameters

##### httpRequestQuery

`IHttpRequestQuery` \| `undefined`

The HTTP request query containing the encrypted values.

##### keys

`string`[]

The keys of the parameters to decrypt.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the query parameters have been decrypted.

#### Implementation of

`IHostingComponent.decryptQueryParams`

***

### encryptParam() {#encryptparam}

> **encryptParam**(`paramValue`): `Promise`\<`string`\>

Encrypt a parameter value using the hosting component's encryption mechanism.

#### Parameters

##### paramValue

`string`

The value of the parameter to encrypt.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the encrypted value of the parameter.

#### Implementation of

`IHostingComponent.encryptParam`

***

### decryptParam() {#decryptparam}

> **decryptParam**(`encryptedValue`): `Promise`\<`string`\>

Decrypt a parameter value using the hosting component's encryption mechanism.

#### Parameters

##### encryptedValue

`string`

The encrypted value of the parameter.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the decrypted value of the parameter.

#### Implementation of

`IHostingComponent.decryptParam`
