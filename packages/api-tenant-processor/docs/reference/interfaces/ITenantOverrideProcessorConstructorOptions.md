# Interface: ITenantOverrideProcessorConstructorOptions

Options for the TenantOverrideProcessor constructor.

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

> `optional` **config?**: [`ITenantOverrideProcessorConfig`](ITenantOverrideProcessorConfig.md)

Configuration for the processor.
