# X-Ray To-do List (Frontend)

A To-do application built with React, TypeScript, and Vite. See [backend README](backend/README.md) for server setup.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file (or use default):
   ```env
   VITE_API_URL=http://localhost:5214
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Design choices

- **Inline Editing**: Streamlined task creation and modification to minimize context switching.
- **X-Ray Aesthetic**: A dark theme featuring cyan accents, glowing effects, and light-box inspired interactions.
- **Robust E2E Coverage**: Comprehensive Playwright test suite ensuring the reliability of all critical user flows.
- **Debounced Search**: Implemented a 300ms debounce on the dashboard search input to prevent unnecessary network spam and UI jitter while typing.
- **Graceful Loading States**: Added minimum delays (e.g., 250ms on Todo Details) to prevent rapid, visually jarring screen flashing when fetching data from a fast local API.
- **Synchronized State over Optimistic UI**: Intentionally opted for strictly synchronized database state updates (awaiting API completion before refreshing local data) to ensure absolute data integrity and avoid complex visual rollbacks during errors.
- **Standardized Iconography**: Standardized entirely on FontAwesome for consistent, scalable vector icons, avoiding the bloat of multiple overlapping icon libraries.
- **HTTP client Abstraction**: Wrapped the native `fetch` API in a custom `apiClient` to centrally manage authentication 401 interception, JSON parsing, and automatic CSRF header injection.

## 🧪 Testing

We use **Playwright** for End-to-End testing. The suite covers registration, login, logout, and all dashboard interactions.

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run tests in UI mode:
```bash
npx playwright test --ui
```
