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

### urlTransformerComponentType? {#urltransformercomponenttype}

> `optional` **urlTransformerComponentType?**: `string`

The URL transformer component for the tenants.

#### Default

```ts
url-transformer
```

***

### config? {#config}

> `optional` **config?**: [`ITenantProcessorConfig`](ITenantProcessorConfig.md)

Configuration for the processor.
