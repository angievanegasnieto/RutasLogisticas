# Copilot Instructions for AI Agents

## Project Overview
- This is an Angular frontend application for a logistics routing system.
- Main app code is in `src/app/` with feature modules under `pages/` and shared/core logic under `core/`.
- Authentication is handled via `core/auth.service.ts` and `core/auth.interceptor.ts` (JWT-based, uses HTTP interceptors).
- Routing is defined in `app.routes.ts` and feature modules (e.g., `dashboard`, `login`, `register`).

## Key Patterns & Conventions
- Use Angular services for API/data access. Place shared logic in `core/`.
- Guards (e.g., `auth.guard.ts`) protect routes requiring authentication.
- Models and interfaces are defined in `core/models.ts`.
- Use `environment.ts` for environment-specific config (API URLs, etc.).
- UI styles are in `styles.scss` and component-level SCSS.
- Error handling and token refresh logic are centralized in `auth.interceptor.ts`.

## Developer Workflows
- **Install dependencies:**
  ```shell
  npm install
  ```
- **Start development server (with proxy):**
  ```shell
  npm start
  # or
  ng serve --proxy-config proxy.conf.json
  ```
- **Build for production:**
  ```shell
  ng build --configuration production
  ```
- **Lint:**
  ```shell
  ng lint
  ```
- **Docker:**
  - Build with the provided `Dockerfile` for containerized deployment.
  - `nginx.conf` is used for static file serving in production containers.

## Integration Points
- API endpoints are proxied via `proxy.conf.json` during development.
- Auth tokens are attached to outgoing HTTP requests by the interceptor.
- External dependencies are managed via `package.json`.

## File/Directory References
- `src/app/core/`: Auth, models, shared logic
- `src/app/pages/`: Feature modules (dashboard, login, register, etc.)
- `src/environments/`: Environment configs
- `Dockerfile`, `nginx.conf`: Containerization and deployment

## Additional Notes
- Follow Angular CLI conventions unless otherwise specified.
- When adding new features, create a new folder under `pages/` and register routes in `app.routes.ts`.
- For cross-cutting concerns (e.g., HTTP, auth), extend or update services/interceptors in `core/`.
