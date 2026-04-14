# Interface: IAuthHeaderProcessorConstructorOptions

Options for the AuthHeaderProcessor constructor.

## Properties

### authenticationAdminServiceType? {#authenticationadminservicetype}

> `optional` **authenticationAdminServiceType?**: `string`

The admin service.

#### Default

```ts
authentication-admin
```

***

### vaultConnectorType? {#vaultconnectortype}

> `optional` **vaultConnectorType?**: `string`

The vault for the private keys.

#### Default

```ts
vault
```

***

### config? {#config}

> `optional` **config?**: [`IAuthHeaderProcessorConfig`](IAuthHeaderProcessorConfig.md)

The configuration for the processor.
