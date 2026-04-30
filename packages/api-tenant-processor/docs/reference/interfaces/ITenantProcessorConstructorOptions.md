# Interface: ITenantProcessorConstructorOptions

Options for the Tenant Processor constructor.

## Properties

### tenantEntityStorageType? {#tenantentitystoragetype}

> `optional` **tenantEntityStorageType?**: `string`

The entity storage for the tenants.

#### Default

```ts
tenant
```

***

### vaultConnectorType? {#vaultconnectortype}

> `optional` **vaultConnectorType?**: `string`

The vault connector used to decrypt tenant tokens. Only resolved when
`config.signingKeyName` is set.

#### Default

```ts
vault
```

***

### config? {#config}

> `optional` **config?**: [`ITenantProcessorConfig`](ITenantProcessorConfig.md)

Configuration for the processor.
