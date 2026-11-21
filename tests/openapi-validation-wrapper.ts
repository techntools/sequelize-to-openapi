/**
 * Unfortunately the generated model schema by itself is not enough to
 * validate against the OpenAPI 3.0 standard as that requires additional
 * nodes like `info`. Before running Swagger Parser we therefore insert
 * the model schema into this skeleton which contains the minimum
 * structure required to pass validation.
 */

export default Object.freeze({
  openapi: '3.0.3',
  info: {
    title: 'Fake API',
    version: '0.0.1',
  },
  paths: {
    '/users': {
      get: {
        parameters: [],
        responses: {
          404: {
            description: 'not found',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      // model schemas will be inserted here
    } as any,
  },
});
