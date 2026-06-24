# Interface: IHealthComponent

The health component for the server.

## Extends

- `IComponent`

## Methods

### healthStatus() {#healthstatus}

> **healthStatus**(): `Promise`\<\{ `status`: `HealthStatus`; `components`: `IHealth`[]; \}\>

Get the server health.

#### Returns

`Promise`\<\{ `status`: `HealthStatus`; `components`: `IHealth`[]; \}\>

The service health.
