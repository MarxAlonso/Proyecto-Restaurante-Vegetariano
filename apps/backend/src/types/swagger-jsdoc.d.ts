declare module 'swagger-jsdoc' {
  import { OpenAPIV3 } from 'openapi-types';
  function swaggerJsDoc(options?: Record<string, unknown>): OpenAPIV3.Document;
  export = swaggerJsDoc;
}
