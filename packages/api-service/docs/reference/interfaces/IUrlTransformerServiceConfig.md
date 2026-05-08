# Interface: IUrlTransformerServiceConfig

Configuration for the URL transformer service.

## Properties

### paramEncryptionKeyName? {#paramencryptionkeyname}

> `optional` **paramEncryptionKeyName?**: `string`

The name of the key to retrieve from the vault for encryption/decryption of parameters.

#### Default

```ts
param-encryption
```

***

### queryParamNames? {#queryparamnames}

> `optional` **queryParamNames?**: `object`

A dictionary mapping logical token identifiers to their URL query parameter names.
For example: tenant => tenant-token maps the logical id "tenant" to the
query param "tenant-token". When an id is not present the id itself is used as
the param name.

#### Index Signature

\[`id`: `string`\]: `string`
