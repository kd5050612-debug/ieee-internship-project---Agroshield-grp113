# TODO - Auth system not working

- [ ] Collect network status codes for auth endpoints:
  - [ ] GET /auth/csrf
  - [ ] POST /auth/login
- [ ] Inspect browser cookie storage for `agrilens_csrf` and `access_token`.
- [ ] Fix likely CSRF/cookie transport issue:
  - [ ] Verify backend cookie flags (COOKIE_SECURE, COOKIE_SAMESITE) vs local http:// setup
  - [ ] Ensure backend CORS allow_origins + allow_credentials matches frontend origin
- [ ] Add minimal debug logging/response details for CSRF failures (dev only).
- [ ] Re-test login flow end-to-end (unlock → OTP modal appears → OTP verification → dashboard loads).

