# Interface: IBaseRoute

Interface which defines a route.

## Extended by

- [`IRestRoute`](IRestRoute.md)
- [`ISocketRoute`](ISocketRoute.md)

## Properties

### operationId {#operationid}

> **operationId**: `string`

The id of the operation.

***

### path {#path}

> **path**: `string`

The path to use for routing.

***

### skipAuth? {#skipauth}

> `optional` **skipAuth?**: `boolean`

Skips the authentication requirement for this route.

***

### skipTenant? {#skiptenant}

> `optional` **skipTenant?**: `boolean`

Skips the tenant requirement for this route.

***

### requiredScope? {#requiredscope}

> `optional` **requiredScope?**: `string`[]

The user must have one of the specified scopes to access the route.

***

### processorFeatures? {#processorfeatures}

> `optional` **processorFeatures?**: `string`[]

The features supported by additional processors to run for this route.

***

### processorData? {#processordata}

> `optional` **processorData?**: `object`

The data for additional processors to run for this route.

#### Index Signature

\[`key`: `string`\]: `unknown`

***

### disableTenantOverride? {#disabletenantoverride}

> `optional` **disableTenantOverride?**: `boolean`

Set to true to prevent callers from using the overrideTenant query parameter on this route.
Tenant override is allowed by default, but you must hold the escalated privilege scope to use it.
