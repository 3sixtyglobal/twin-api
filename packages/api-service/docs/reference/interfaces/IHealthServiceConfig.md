# Interface: IHealthServiceConfig

Configuration for the health service.

## Properties

### healthCheckInterval? {#healthcheckinterval}

> `optional` **healthCheckInterval?**: `number`

The interval for checking the health of the components and setting it in the health service.

#### Default

```ts
60000
```

***

### initialInterval? {#initialinterval}

> `optional` **initialInterval?**: `number`

The initial interval for checking the health of the components and setting it in the health service.
This is used to check the health of the components immediately after the service is started.

#### Default

```ts
2000
```

***

### includeErrorStack? {#includeerrorstack}

> `optional` **includeErrorStack?**: `boolean`

Whether to include stack traces in health check error details.

#### Default

```ts
false
```
