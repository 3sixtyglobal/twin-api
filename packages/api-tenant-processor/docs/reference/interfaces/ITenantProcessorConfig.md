# Interface: ITenantProcessorConfig

Configuration for the tenant processor

## Properties

### apiKeyName? {#apikeyname}

> `optional` **apiKeyName?**: `string`

The key to look for in the header or query params for the api key.

#### Default

```ts
x-api-key
```

***

### signingKeyName? {#signingkeyname}

> `optional` **signingKeyName?**: `string`

The name of the symmetric key in the vault used to encrypt/decrypt tenant tokens.

#### Default

```ts
tenant-token-encryption
```

***

### tenantTokenName? {#tenanttokenname}

> `optional` **tenantTokenName?**: `string`

The query param name to look for the encrypted tenant token.

#### Default

```ts
tenantToken
```
