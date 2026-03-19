# Interface: IEntityStorageAuthenticationServiceConstructorOptions

Options for the EntityStorageAuthenticationService constructor.

## Properties

### userEntityStorageType? {#userentitystoragetype}

> `optional` **userEntityStorageType?**: `string`

The entity storage for the users.

#### Default

```ts
authentication-user
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

### authenticationAdminServiceType? {#authenticationadminservicetype}

> `optional` **authenticationAdminServiceType?**: `string`

The admin service.

#### Default

```ts
authentication-admin
```

***

### config? {#config}

> `optional` **config?**: [`IEntityStorageAuthenticationServiceConfig`](IEntityStorageAuthenticationServiceConfig.md)

The configuration for the authentication.
