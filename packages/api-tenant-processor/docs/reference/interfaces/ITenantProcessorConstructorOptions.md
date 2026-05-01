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

### hostingComponentType? {#hostingcomponenttype}

> `optional` **hostingComponentType?**: `string`

The hosting component for the tenants.

#### Default

```ts
hosting
```

***

### config? {#config}

> `optional` **config?**: [`ITenantProcessorConfig`](ITenantProcessorConfig.md)

Configuration for the processor.
