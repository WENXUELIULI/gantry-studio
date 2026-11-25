# GANTRY API / Spring Boot

Java 21 + Spring Boot 3.5.6 backend for accounts, cloud projects, multi-page
documents, and export artifacts.

## Requirements

- JDK 21+ (verified on JDK 26)
- Maven 3.9+

## Run locally

```bash
mvn spring-boot:run
```

The API starts on `http://127.0.0.1:8080`.

Default development database is H2 file mode:

```text
jdbc:h2:file:./data/gantry;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH
```

The file lives in `backend/data/`, which is ignored by git.

## PostgreSQL

```bash
SPRING_PROFILES_ACTIVE=postgres \
DB_URL=jdbc:postgresql://localhost:5432/gantry \
DB_USER=gantry \
DB_PASSWORD=gantry \
JWT_SECRET='replace-with-at-least-32-characters' \
mvn spring-boot:run
```

Flyway runs `src/main/resources/db/migration` at startup.

## Test

```bash
mvn -B test
```

Coverage:

- `AuthFlowTest`: register, me, refresh rotation, old refresh rejection, bad
  password, unauthenticated request.
- `ProjectFlowTest`: create project, add page, save page, optimistic-lock 409,
  Free JSON export 402, upgrade to Pro, JSON export and download.

## Layout

```text
src/main/java/com/gantry/
├── auth/          register/login/refresh/logout, JWT sessions
├── common/        ApiError, ApiException, global handler
├── config/        limits, CORS properties
├── export/        export artifacts and Pro gating
├── project/       projects and pages
├── security/      JWT service, filter, security config
└── user/          user entity, plan, repository
```

## Open work

- Real source-code generation (the current JSON file is a project document,
  not generated Java/React source).
- Payment provider integration (Stripe / WeChat Pay / Alipay).
- API rate limiting and production observability.
