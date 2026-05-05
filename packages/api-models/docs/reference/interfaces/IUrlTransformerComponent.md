# Interface: IUrlTransformerComponent

The URL transformer component for encrypting and decrypting URL parameters.

## Extends

- `IComponent`

## Methods

### addEncryptedQueryParamToUrl() {#addencryptedqueryparamtourl}

> **addEncryptedQueryParamToUrl**(`url`, `id`, `value`): `Promise`\<`string`\>

Encrypt a named token value and append it as a query parameter to the given URL.
The URL param name is resolved from the configured token name dictionary using the id.

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

***

### getEncryptedQueryParam() {#getencryptedqueryparam}

> **getEncryptedQueryParam**(`queryParams`, `id`): `Promise`\<`string` \| `undefined`\>

Get a named token value from the query parameters.
The URL param name is resolved from the configured token name dictionary using the id.

#### Parameters

##### queryParams

[`IHttpRequestQuery`](IHttpRequestQuery.md) \| `undefined`

The HTTP request query containing the parameters.

##### id

`string`

The logical token identifier (e.g. "tenant").

#### Returns

`Promise`\<`string` \| `undefined`\>

The decrypted token value if it exists.

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

[`IHttpRequestQuery`](IHttpRequestQuery.md)

The key/value pairs to encrypt and append.

#### Returns

`Promise`\<`string`\>

The URL with the encrypted parameters added.

***

### getDecryptedParamsFromQueryParams() {#getdecryptedparamsfromqueryparams}

> **getDecryptedParamsFromQueryParams**(`queryParams`, `keys`): `Promise`\<[`IHttpRequestQuery`](IHttpRequestQuery.md)\>

Decrypt specified keys from a query parameter object and return their plain-text values.

#### Parameters

##### queryParams

[`IHttpRequestQuery`](IHttpRequestQuery.md) \| `undefined`

The HTTP request query containing the encrypted parameters.

##### keys

`string`[]

The keys to decrypt.

#### Returns

`Promise`\<[`IHttpRequestQuery`](IHttpRequestQuery.md)\>

A map of the decrypted key/value pairs that were present.

***

### encryptQueryParams() {#encryptqueryparams}

> **encryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Encrypt query parameters using the URL transformer's encryption mechanism.

#### Parameters

##### httpRequestQuery

[`IHttpRequestQuery`](IHttpRequestQuery.md) \| `undefined`

The HTTP request query containing the parameters to encrypt.

##### keys

`string`[]

The keys of the parameters to encrypt.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the query parameters have been encrypted.

***

### decryptQueryParams() {#decryptqueryparams}

> **decryptQueryParams**(`httpRequestQuery`, `keys`): `Promise`\<`void`\>

Decrypt query parameters using the URL transformer's encryption mechanism.

#### Parameters

##### httpRequestQuery

[`IHttpRequestQuery`](IHttpRequestQuery.md) \| `undefined`

The HTTP request query containing the encrypted values.

##### keys

`string`[]

The keys of the parameters to decrypt.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the query parameters have been decrypted.

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
