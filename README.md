# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Tarrot pages & APIs (Added)

- Client tarrot page: `/tarrot`
- Admin tarrot management: `/tarrot-admin`

APIs (server runs on port 3000):
- `GET /api/reviews` - list reviews for tarrot
- `POST /api/reviews` - create review ({ name, rating, comment, product? })
- `DELETE /api/reviews/:id` - delete review (admin only)

Admin auth endpoints:
- `POST /api/admin/login` - login with admin email/password, returns `{ token }`
- `GET /api/admin/me` - returns current admin info (admin only)

The server will automatically create the `reviews` table on startup if it does not exist.

Env variables (optional):
- `ADMIN_EMAIL` default `admin@local`
- `ADMIN_PASSWORD` default `adminpass`
- `JWT_SECRET` default `dev-secret-token`

For local testing, a default admin user is created on first run if none exists (use the env vars above to change credentials).
