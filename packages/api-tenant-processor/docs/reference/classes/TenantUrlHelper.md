# Class: TenantUrlHelper

Helper for building and parsing URLs that carry an encrypted tenant token query param.
The token is the ChaCha20Poly1305-encrypted UTF-8 bytes of a tenant id, base64url-encoded
for URL safety.

## Constructors

### Constructor

> **new TenantUrlHelper**(): `TenantUrlHelper`

#### Returns

`TenantUrlHelper`

## Properties

### DEFAULT\_TENANT\_TOKEN\_NAME {#default_tenant_token_name}

> `readonly` `static` **DEFAULT\_TENANT\_TOKEN\_NAME**: `string` = `"tenantToken"`

The default query param name for the encrypted tenant token.

***

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### encrypt() {#encrypt}

> `static` **encrypt**(`url`, `tenantId`, `vaultConnector`, `keyName`, `tenantTokenName?`): `Promise`\<`string`\>

Encrypt a tenant id and append it as an opaque query param to the supplied URL.

#### Parameters

##### url

`string`

The URL to append the token to.

##### tenantId

`string`

The tenant id to encrypt into the token.

##### vaultConnector

`IVaultConnector`

The vault connector providing the symmetric key.

##### keyName

`string`

The fully-qualified vault key name (e.g. `${nodeId}/tenant-token-encryption`).

##### tenantTokenName?

`string`

The query param name. Defaults to `tenantToken`.

#### Returns

`Promise`\<`string`\>

The URL with the encrypted tenant token appended.

***

### decrypt() {#decrypt}

> `static` **decrypt**(`token`, `vaultConnector`, `keyName`): `Promise`\<`string`\>

Decrypt an encrypted tenant token back into the original tenant id.

#### Parameters

##### token

`string`

The base64url-encoded encrypted tenant token.

##### vaultConnector

`IVaultConnector`

The vault connector providing the symmetric key.

##### keyName

`string`

The fully-qualified vault key name used to encrypt the token.

#### Returns

`Promise`\<`string`\>

The decrypted tenant id.
