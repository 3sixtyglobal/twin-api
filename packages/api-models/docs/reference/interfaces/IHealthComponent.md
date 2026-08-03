# Interface: IHealthComponent

The health component for the server.

## Extends

- `IComponent`

## Methods

### healthStatus() {#healthstatus}

> **healthStatus**(): `Promise`\<\{ `status`: [`HealthStatus`](../type-aliases/HealthStatus.md); `components`: [`IHealth`](IHealth.md)[]; \}\>

Get the server health.

#### Returns

`Promise`\<\{ `status`: [`HealthStatus`](../type-aliases/HealthStatus.md); `components`: [`IHealth`](IHealth.md)[]; \}\>

The service health.
