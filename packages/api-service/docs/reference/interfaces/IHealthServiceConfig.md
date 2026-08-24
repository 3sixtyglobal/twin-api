# Interface: IHealthServiceConfig

Configuration for the health service.

## Properties

### healthCheckInterval? {#healthcheckinterval}

> `optional` **healthCheckInterval?**: `number`

The interval for checking the health of the components.

#### Default

```ts
60000
```

***

### healthCheckApplicationInterval? {#healthcheckapplicationinterval}

> `optional` **healthCheckApplicationInterval?**: `number`

The interval for running the application health lifecycle (init, application, teardown).

#### Default

```ts
300000
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

***

### overrideApplicationHealthTaskHandler? {#overrideapplicationhealthtaskhandler}

> `optional` **overrideApplicationHealthTaskHandler?**: `string`

The URL of the module to use for the application health background task.
If not provided, the default healthApplicationTask module will be used.
