# ADR 001: Use Express.js for the Backend API

## Status

Accepted

## Context

The IDSC Portal Faculty System requires a REST API that implements
the endpoints defined in the OpenAPI contract.

The backend must support:

- REST API endpoints
- JSON request and response bodies
- Swagger UI
- Middleware
- Error handling
- Layered architecture
- Future integration with a database
- Future authentication and authorization

## Decision

We will use Node.js with Express.js as the backend framework.

## Reasons

1. The team already has experience with Node.js and Express.js.
2. Express provides simple routing and middleware support.
3. Express works well with REST APIs.
4. Express can easily integrate with PostgreSQL in a future milestone.
5. Swagger UI can be integrated into an Express application.
6. The framework allows us to separate routes, services, and data layers.

## Consequences

### Positive

- Easy for the team to understand.
- Fast to develop.
- Good support for REST APIs.
- Easy integration with frontend applications.
- Easy migration from mock data to PostgreSQL.

### Negative

- Express does not enforce project architecture automatically.
- Developers must maintain the routes → services → data structure.
- Authentication and validation must be implemented separately.

## Alternatives Considered

### FastAPI

FastAPI was considered because of its automatic OpenAPI support,
but the team has more experience with JavaScript and Express.

### Laravel

Laravel was considered, but the project frontend uses JavaScript
and the team prefers a JavaScript-based backend.

## Final Decision

Use Node.js + Express.js for the IDSC Portal Faculty System backend.