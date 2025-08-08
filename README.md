# Todo (Node.js + Express + Prisma + MongoDB)

A simple todo app with server-rendered pages (EJS) and a small JSON API. Users can register/login, manage todos (create, update, delete, toggle done/publish), and browse published todos. Sessions power the web UI, while the API uses JWT.

## Features

- Express 5 server with EJS views
- Prisma (MongoDB) data layer
- User auth: session (web) and JWT (API)
- Todo CRUD, toggle isDone/isPublish, pagination
- Clean separation of routes/controllers/models

## Tech stack

- Node.js, Express 5, EJS
- Prisma 6 + @prisma/client (MongoDB provider)
- express-session, jsonwebtoken, bcryptjs, dotenv

## Project structure

```
src/
	index.js                # App entrypoint, mounts routes and views
	routes/
		indexRoutes.js        # Home + My Todo pages and CRUD (session required)
		webRoutes.js          # Login/Register/Logout pages
		authRoutes.js         # JSON Auth API (register/login/logout/current/refresh)
		userRoutes.js         # JSON User API (CRUD)
	controllers/
		AuthController.js     # Auth API logic (JWT + session)
		UserController.js     # User API logic
	middlewares/
		auth.js               # Session/JWT middlewares
	models/
		User.js               # Prisma User model helpers
		Todo.js               # Prisma Todo model helpers
views/
	index.ejs, myTodo.ejs, login.ejs, register.ejs
prisma/
	schema.prisma           # Prisma schema (MongoDB)
package.json
```

## Prerequisites

- Node.js 18+ (recommended)
- A MongoDB database (local or Atlas)
- Yarn or npm

## Configuration

Create a .env file in the project root with:

```env
# Server
PORT=3000
NODE_ENV=development

# Sessions (web)
SESSION_SECRET=replace-with-a-strong-random-string

# JWT (API)
JWT_SECRET=replace-with-a-strong-random-string

# Prisma (MongoDB)
DATABASE_URL="mongodb+srv://USER:PASS@HOST/DB_NAME?retryWrites=true&w=majority"
```

## Install & database setup

1. Install dependencies

```bash
yarn install
```

2. Generate Prisma Client

```bash
npx prisma generate
```

3. Sync schema to MongoDB (MongoDB typically uses db push)

```bash
npx prisma db push
```

Optional: open Prisma Studio

```bash
npx prisma studio
```

## Run

- Development (with nodemon):

```bash
yarn dev
```

- Production:

```bash
yarn start
```

Then visit http://localhost:3000

## Web routes (session-based)

- GET / — list published todos (paginated: ?page=1&limit=10)
- GET /my-todo — manage your todos (requires login)
- POST /my-todo — create todo (title, content, from, to, isPublish)
- POST /my-todo/:id/update — update fields
- POST /my-todo/:id/delete — delete
- POST /my-todo/:id/toggle-done — toggle completion
- POST /my-todo/:id/toggle-publish — toggle publish

Auth pages:

- GET /auth/login — login form
- POST /auth/login — sets session
- GET /auth/register — register form
- POST /auth/register — creates user + sets session
- GET /auth/logout — clears session

## API routes (JWT-based)

Base path: /api

Auth:

- POST /api/auth/register { email, password, name }
- POST /api/auth/login { email, password }
- POST /api/auth/logout
- GET /api/auth/current — current user (via Authorization: Bearer <token> or active session)
- POST /api/auth/refresh — refresh token (send current token)

Users:

- GET /api/user — list users
- GET /api/user/:id — get user
- POST /api/user — create user
- PUT /api/user/:id — update user
- DELETE /api/user/:id — delete user

Notes

- The API sets an httpOnly auth_token cookie and also returns the token in JSON.
- Send Authorization: Bearer <token> to authenticate API calls.
- The web UI relies on session cookie (connect.sid).

## Data model (Prisma)

- User: id(ObjectId), email(unique), name, password(hashed), todos[]
- Todo: id(ObjectId), title, content, isDone, isPublish, from(Date), to(Date), authorId -> User

## Scripts

- yarn dev — start with nodemon
- yarn start — start with node

## Troubleshooting

- Prisma errors (generate/db push):
  - Ensure DATABASE_URL is valid and MongoDB is reachable.
  - If the port 3000 is in use, change PORT in .env.
- Session/JWT in production:
  - Set NODE_ENV=production to enable secure cookies (served over HTTPS).
  - Use strong, unique SESSION_SECRET and JWT_SECRET.

## License

MIT
