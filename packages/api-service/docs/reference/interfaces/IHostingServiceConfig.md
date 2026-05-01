# Interface: IHostingServiceConfig

Configuration for the hosting service.

## Properties

### localOrigin {#localorigin}

> **localOrigin**: `string`

The local origin, must be provided as a fallback e.g. http://localhost:1234.

***

### publicOrigin? {#publicorigin}

> `optional` **publicOrigin?**: `string`

The APIs public base URL e.g. "https://api.example.com:1234".

***

### paramEncryptionKeyName? {#paramencryptionkeyname}

> `optional` **paramEncryptionKeyName?**: `string`

The name of the key to retrieve from the vault for encryption/decryption of parameters.

#### Default

```ts
param-encryption
```

***

### tenantTokenName? {#tenanttokenname}

> `optional` **tenantTokenName?**: `string`

The query param name to look for the encrypted tenant token.

#### Default

```ts
tenant-token
```
