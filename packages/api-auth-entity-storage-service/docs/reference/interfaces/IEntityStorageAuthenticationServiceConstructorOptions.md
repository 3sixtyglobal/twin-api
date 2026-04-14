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

### authenticationAuditServiceType? {#authenticationauditservicetype}

> `optional` **authenticationAuditServiceType?**: `string`

The audit service.

#### Default

```ts
authentication-audit
```

***

### authenticationRateServiceType? {#authenticationrateservicetype}

> `optional` **authenticationRateServiceType?**: `string`

The rate service.

#### Default

```ts
authentication-rate
```

***

### config? {#config}

> `optional` **config?**: [`IEntityStorageAuthenticationServiceConfig`](IEntityStorageAuthenticationServiceConfig.md)

The configuration for the authentication.
