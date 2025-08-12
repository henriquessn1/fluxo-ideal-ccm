# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Client monitoring dashboard built with React 19, TypeScript, and Vite. Features Keycloak authentication with OIDC/PKCE flow, real-time monitoring with 30-second auto-refresh, and role-based access control (admin/user).

## Commands

```bash
npm run dev        # Start development server on http://localhost:5173
npm run build      # Build for production (runs TypeScript compiler first)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality checks
```

## Architecture

### Authentication Flow
- **Keycloak Integration**: OIDC authentication with PKCE flow in `src/auth/`
- **AuthContext**: Manages user state, token refresh, and role-based permissions
- **Protected Routes**: Components in `src/components/ProtectedRoute.tsx` enforce authentication
- **Token Validation**: Automatic refresh with proper error handling

### Data Management
- **React Query**: All API calls use React Query for caching and state management
- **Mock Data**: Development mode uses mock data from `src/services/mockData.ts`
- **API Services**: Centralized in `src/services/api.ts` with proper TypeScript typing
- **Custom Hooks**: Data fetching hooks in `src/hooks/` with auto-refresh logic

### Component Structure
- **Pages**: Main views in `src/pages/` (Dashboard, ClientDetails, ClientForm)
- **UI Components**: Reusable components in `src/components/`
- **Layout**: App shell with navigation in `src/components/Layout.tsx`
- **Forms**: Client management forms with validation in `src/pages/ClientForm.tsx`

### Key Features
- **Client Monitoring**: Real-time status tracking (online/offline/warning)
- **Metrics Dashboard**: CPU, memory, disk usage visualization
- **CRUD Operations**: Full client management for admin users
- **Auto-refresh**: 30-second polling for live updates
- **Role-based Access**: Admin and user roles with different permissions

## Environment Configuration

Required environment variables (see `.env.example` or `.env.local`):
```
# Database Configuration (PostgreSQL)
VITE_DB_HOST=10.102.1.16        # Local test server
VITE_DB_PORT=5432
VITE_DB_USER=geraldb_user
VITE_DB_PASSWORD=Jk16OFyM6rBebmWJS5YPp6Y9
VITE_DB_NAME=geraldb

# Redis Cache Configuration
VITE_REDIS_HOST=10.102.1.16     # Local test server
VITE_REDIS_PORT=6379
VITE_REDIS_PASSWORD=plBroNb2Hhfnan3v5LqnX9J4

# Keycloak Configuration
VITE_KEYCLOAK_URL=http://your-keycloak-server/auth
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id

# API Configuration
VITE_API_BASE_URL=http://your-api-server
```

For local development setup, see `LOCAL_SETUP.md` for detailed instructions.

## Development Notes

- Mock data is enabled by default - toggle `USE_MOCK_DATA` in `src/services/api.ts`
- Keycloak configuration is in `src/auth/keycloak.ts`
- All TypeScript types are in `src/types/`
- Tailwind config includes custom animations and responsive breakpoints
- ESLint is configured for React 19 with TypeScript support

## Testing

No test framework configured yet. To add tests:
1. Install testing dependencies (Vitest recommended for Vite projects)
2. Create test files alongside components with `.test.tsx` extension
3. Add test scripts to package.json

## Deployment

1. Configure environment variables for production
2. Run `npm run build` to create optimized bundle
3. Deploy `dist/` folder to static hosting service
4. Ensure Keycloak server is accessible from production environment
5. Configure CORS and redirect URIs in Keycloak client settings