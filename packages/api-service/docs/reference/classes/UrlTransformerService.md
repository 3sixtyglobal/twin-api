# Class: UrlTransformerService

The URL transformer service for encrypting and decrypting URL parameters.

## Implements

- `IUrlTransformerComponent`

## Constructors

### Constructor

> **new UrlTransformerService**(`options?`): `UrlTransformerService`

Create a new instance of UrlTransformerService.

#### Parameters

##### options?

[`IUrlTransformerServiceConstructorOptions`](../interfaces/IUrlTransformerServiceConstructorOptions.md)

The options to create the service.

#### Returns

`UrlTransformerService`

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

`IUrlTransformerComponent.className`

***

### start() {#start}

> **start**(): `Promise`\<`void`\>

The component needs to be started when the node is initialized.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IUrlTransformerComponent.start`

***

### addEncryptedQueryParamToUrl() {#addencryptedqueryparamtourl}

> **addEncryptedQueryParamToUrl**(`url`, `id`, `value`): `Promise`\<`string`\>

Encrypt a named token value and append it as a query parameter to the given URL.

#### Parameters

##### url

`string`

The URL to append the encrypted token to.

##### id

`string`

The logical token identifier (e.g. "tenant").

##### value

`string`

The value to encrypt and add.

#### Returns

`Promise`\<`string`\>

The URL with the encrypted token added as a query parameter.

#### Implementation of

`IUrlTransformerComponent.addEncryptedQueryParamToUrl`

***

### getEncryptedQueryParam() {#getencryptedqueryparam}

> **getEncryptedQueryParam**(`queryParams`, `id`): `Promise`\<`string` \| `undefined`\>

Get a named token value from the query parameters.

#### Parameters

##### queryParams

`IHttpRequestQuery` \| `undefined`

The HTTP request query containing the parameters.

##### id

`string`

The logical token identifier (e.g. "tenant").

#### Returns

`Promise`\<`string` \| `undefined`\>

The decrypted token value if it exists.

#### Implementation of

`IUrlTransformerComponent.getEncryptedQueryParam`

***

### addEncryptedToUrl() {#addencryptedtourl}

> **addEncryptedToUrl**(`url`, `params`): `Promise`\<`string`\>

Add encrypted key/value pairs to a URL's query string.

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

`IUrlTransformerComponent.addEncryptedToUrl`

***

### getEncryptedFromUrl() {#getencryptedfromurl}

> **getEncryptedFromUrl**(`url`, `id`): `Promise`\<`string` \| `undefined`\>

Get an encrypted value from a URL's query string.

#### Parameters

##### url

`string`

The URL to extract the encrypted value from.

##### id

`string`

The logical identifier for the value to retrieve (e.g. "tenant").

#### Returns

`Promise`\<`string` \| `undefined`\>

The decrypted value if it exists.

#### Implementation of

`IUrlTransformerComponent.getEncryptedFromUrl`

***

### getDecryptedFromQueryParams() {#getdecryptedfromqueryparams}

> **getDecryptedFromQueryParams**(`queryParams`, `keys`): `Promise`\<`IHttpRequestQuery`\>

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

`IUrlTransformerComponent.getDecryptedFromQueryParams`

***

### encryptQueryParams() {#encryptqueryparams}

> **encryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Encrypt query parameters.

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

`IUrlTransformerComponent.encryptQueryParams`

***

### decryptQueryParams() {#decryptqueryparams}

> **decryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Decrypt query parameters.

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

`IUrlTransformerComponent.decryptQueryParams`

***

### encryptParam() {#encryptparam}

> **encryptParam**(`paramValue`): `Promise`\<`string`\>

Encrypt a parameter value.

#### Parameters

##### paramValue

`string`

The value of the parameter to encrypt.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the encrypted value of the parameter.

#### Implementation of

`IUrlTransformerComponent.encryptParam`

***

### decryptParam() {#decryptparam}

> **decryptParam**(`encryptedValue`): `Promise`\<`string`\>

Decrypt a parameter value.

#### Parameters

##### encryptedValue

`string`

The encrypted value of the parameter.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the decrypted value of the parameter.

#### Implementation of

`IUrlTransformerComponent.decryptParam`

***

### getParamName() {#getparamname}

> **getParamName**(`key`): `string` \| `undefined`

Get the parameter name for a given key.

#### Parameters

##### key

`string`

The key of the parameter.

#### Returns

`string` \| `undefined`

The parameter name.

#### Implementation of

`IUrlTransformerComponent.getParamName`
