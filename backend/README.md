# PUEFix Garage Backend

Setup

1. Node.js 18+ recommended (works with Node 22).
2. Copy ENV.EXAMPLE to .env and fill values:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<long_random_secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

3. Install and run:

```
npm install
npm run dev
```

Useful endpoints

- Health: GET /api/health
- Version: GET /api/version
- Docs: GET /api/docs

Endpoints

- Auth: /api/auth/\*
- Cars: /api/cars
- Jobs: /api/jobs
- Inventory: /api/inventory
- Mechanics: /api/mechanics
- Payments: /api/payments

Responses map `_id` to `id` and use `{ success, ... }`.
