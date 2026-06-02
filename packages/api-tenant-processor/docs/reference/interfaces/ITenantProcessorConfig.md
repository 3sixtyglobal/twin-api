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

### apiKeyEndpoints? {#apikeyendpoints}

> `optional` **apiKeyEndpoints?**: `string`[]

The list of endpoint paths that should be checked for an api key header, can be regexp strings. Defaults to ["/login$"].
