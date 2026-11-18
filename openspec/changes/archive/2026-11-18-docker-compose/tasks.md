## 1. Compose stack and production config

- [x] 1.1 Add Compose migration, single-backend, and frontend services with the required startup conditions and named SQLite volume.
- [x] 1.2 Require the three secrets through Compose interpolation and add a production backend startup guard against empty and placeholder secrets.
- [x] 1.3 Add and validate production secret tests.
- [x] 1.4 Update `backend/.env.example` for production and the deployment origin without usable secrets.
- [x] 1.5 Verify proxy client-IP forwarding and write a precise explanation of the rate-limit key path.

## 2. Verification

- [x] 2.1 Run the Docker Compose stack from a clean test volume and verify migration/service health and the single exposed port.
- [x] 2.2 Verify Compose missing-secret and backend placeholder-secret failures.
- [x] 2.3 Run backend and frontend checks and validate the OpenSpec change.
