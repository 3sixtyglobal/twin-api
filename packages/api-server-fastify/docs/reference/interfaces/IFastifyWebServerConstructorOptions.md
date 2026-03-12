# Interface: IFastifyWebServerConstructorOptions

The options for the Fastify web server constructor.

## Properties

### loggingComponentType? {#loggingcomponenttype}

> `optional` **loggingComponentType**: `string`

The type of the logging component to use, if undefined, no logging will happen.

***

### hostingComponentType? {#hostingcomponenttype}

> `optional` **hostingComponentType**: `string`

The type of the hosting component to use.

***

### config? {#config}

> `optional` **config**: [`IFastifyWebServerConfig`](IFastifyWebServerConfig.md)

Additional configuration for the server.

***

### mimeTypeProcessors? {#mimetypeprocessors}

> `optional` **mimeTypeProcessors**: `IMimeTypeProcessor`[]

Additional MIME type processors.
