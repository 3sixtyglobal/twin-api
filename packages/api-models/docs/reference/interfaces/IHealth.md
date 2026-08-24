# Interface: IHealth

Provides health information for a component.

## Properties

### source {#source}

> **source**: `string`

The source of the health information.

***

### description? {#description}

> `optional` **description?**: `string`

The description of the component as an i18n key.

***

### category? {#category}

> `optional` **category?**: [`HealthCategory`](../type-aliases/HealthCategory.md)

The category of the health check.

***

### status {#status}

> **status**: [`HealthStatus`](../type-aliases/HealthStatus.md)

The overall status of the component, the entries can also report their own health.

***

### error? {#error}

> `optional` **error?**: `IError`

The error details when the status is not Ok.

***

### message? {#message}

> `optional` **message?**: `string`

The message for the status if there are further details to provide as an i18n key.

***

### data? {#data}

> `optional` **data?**: `object`

Data to substitute in the i18n key for the message.

#### Index Signature

\[`id`: `string`\]: `unknown`

***

### grouped? {#grouped}

> `optional` **grouped?**: `IHealth`[]

The grouped child components, if any.
