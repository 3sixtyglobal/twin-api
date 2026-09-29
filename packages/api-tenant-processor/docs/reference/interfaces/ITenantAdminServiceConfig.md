# Interface: ITenantAdminServiceConfig

Configuration for the tenant admin service.

## Properties

### tenantCacheTtlMs? {#tenantcachettlms}

> `optional` **tenantCacheTtlMs?**: `number`

The time in milliseconds a tenant is kept in the in-memory lookup cache, counted from when it
was read and not extended by use, set to 0 to disable caching. Entries are invalidated when a
tenant is created, updated or removed through this service, but only in the process that made
the change, so this is also the longest another node can serve a tenant that has been edited
elsewhere.

#### Default

```ts
30000
```

***

### tenantCacheCapacity? {#tenantcachecapacity}

> `optional` **tenantCacheCapacity?**: `number`

The maximum number of tenant lookups to hold in the in-memory cache.

#### Default

```ts
undefined (LfuCache default)
```

***

### tenantCacheMutexTimeoutMs? {#tenantcachemutextimeoutms}

> `optional` **tenantCacheMutexTimeoutMs?**: `number`

Maximum time in milliseconds to wait for the tenant cache mutex during a cache population.

#### Default

```ts
undefined (LfuCache default)
```
