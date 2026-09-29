# Interface: ITenantProcessorConstructorOptions

Options for the Tenant Processor constructor.

## Properties

### tenantAdminComponentType? {#tenantadmincomponenttype}

> `optional` **tenantAdminComponentType?**: `string`

The component used to resolve tenants, which also provides the lookup caching.

#### Default

```ts
tenant-admin
```

***

### config? {#config}

> `optional` **config?**: [`ITenantProcessorConfig`](ITenantProcessorConfig.md)

Configuration for the processor.
