# X-Ray To-do List (Backend)

A lightweight API built with ASP.NET Core 10 Minimal APIs, providing secure, isolated data storage for the frontend application. See [frontend README](../frontend/README.md) for UI setup.

## 🚀 Getting Started

### Prerequisites

- .NET 10 SDK

### Installation & Running

1. Restore dependencies and start the API:
   ```bash
   dotnet run
   ```
   *Note: The SQLite database (`todo.db`) is automatically created on startup.*

## 📐 Design choices

- **Minimal APIs**: Utilized Minimal APIs to create a lightweight, performant API, keeping routing and behavior concise.
- **Simplistic Architecture**: Explicitly avoided complex layers (DTOs, Repositories) to keep the architecture appropriate for the scope of a simple app.
- **Handler Separation**: Extracted Minimal API inline logic into a dedicated `TodoHandlers` static class. This allows the business logic to be easily isolated for unit testing.
- **Secure Authentication**: 
  - Uses strictly scoped **HttpOnly Cookies** (with `SameSite=Strict`) instead of `localStorage` tokens to completely eliminate XSS vulnerabilities.
  - Leverages **ASP.NET Core built-in DPAPI** for token encryption out-of-the-box, letting the OS securely manage the cryptographic keys rather than requiring manual JWT secret rotation.
- **CSRF Protection**: Integrated **The Double Submit Cookie Pattern** (ASP.NET Core Antiforgery) to ensure all state-changing mutations are verified against cross-site request forgery attacks.
- **Data Validation**: Leveraged the new .NET 10 `AddValidation()` feature to natively map Model DataAnnotations directly to detailed HTTP 400 Bad Request responses.
- **Problem Details**: Standardized all explicit error responses using the RFC standard `ProblemDetails` format.
- **Cross-Origin Resource Sharing (CORS)**: Configured a strict CORS policy for `localhost`. Even though both run locally on the same localhost domain, CORS demonstrates a more production minded setup.

## 🧪 Testing

The backend includes two layers of automated testing (run via `dotnet test`):

1. **Unit Tests**: Uses `Moq` (with `MockQueryable`) to mock the `TodoDbContext`, allowing lightning-fast validation of `TodoHandlers` logic in complete isolation without hitting a real database.
2. **Integration Tests**: Tests the full request pipeline via `WebApplicationFactory`. These tests use an in-memory SQLite database that is freshly wiped and seeded before each test. This ensures database-level constraints and routing behave correctly, bypassing the practical limitations of pure mock DBs.