# Interface: IHealthServiceConstructorOptions

Options for the HealthService constructor.

## Properties

### backgroundTaskComponentType? {#backgroundtaskcomponenttype}

> `optional` **backgroundTaskComponentType?**: `string`

The background task component type to use for running application health checks.

#### Default

```ts
background-task
```

***

### config? {#config}

> `optional` **config?**: [`IHealthServiceConfig`](IHealthServiceConfig.md)

The configuration for the service.
