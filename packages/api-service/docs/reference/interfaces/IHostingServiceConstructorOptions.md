# Interface: IHostingServiceConstructorOptions

Options for the IHostingService constructor.

## Properties

### tenantAdminComponentType? {#tenantadmincomponenttype}

> `optional` **tenantAdminComponentType?**: `string`

The tenant admin component type.

#### Default

```ts
tenant-admin
```

***

### vaultConnectorType? {#vaultconnectortype}

> `optional` **vaultConnectorType?**: `string`

The vault connector type.

#### Default

```ts
vault
```

***

### config {#config}

> **config**: [`IHostingServiceConfig`](IHostingServiceConfig.md)

The configuration for the service.
