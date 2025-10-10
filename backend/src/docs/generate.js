import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const spec = YAML.load(new URL('./openapi.yaml', import.meta.url));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

const port = process.env.DOCS_PORT || 5050;
app.listen(port, () => {
  console.log(`Docs available at http://localhost:${port}/api/docs`);
});


