# OnboardLink Architecture Documentation

## Overview

OnboardLink is a Next.js 15+ application built with TypeScript, Firebase, and modern React patterns. The application follows a strict client/server separation architecture with proper type safety and validation.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── login/             # Authentication pages
│   ├── onboarding/        # Multi-step onboarding flow
│   └── partner/           # Partner dashboard pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── ...               # Feature-specific components
├── hooks/                 # Client-side React hooks
│   ├── use-auth-client.tsx    # Authentication hook
│   └── use-submission-client.tsx # Submission management hook
├── lib/                   # Core utilities and configurations
│   ├── actions/          # Server actions
│   │   ├── auth.ts       # Authentication server actions
│   │   └── submissions.ts # Submission management server actions
│   ├── firebase/         # Firebase configurations
│   │   ├── client.ts     # Firebase Web SDK (client-side)
│   │   └── admin.ts      # Firebase Admin SDK (server-side)
│   ├── schemas/          # Zod validation schemas
│   │   └── index.ts      # All application schemas
│   └── utils/            # Utility functions
│       └── index.ts      # Common utilities
└── ai/                   # AI/ML integrations
    └── genkit.ts         # Genkit AI configuration
```

## Architecture Principles

### 1. Client/Server Separation

- **Client-side**: Uses Firebase Web SDK for real-time data and authentication
- **Server-side**: Uses Firebase Admin SDK for secure operations and data validation
- **Server Actions**: Handle all data mutations with proper validation

### 2. Type Safety

- **Zod Schemas**: All data structures are validated using Zod
- **TypeScript**: Strict TypeScript configuration with comprehensive type checking
- **Type Inference**: Automatic type inference from Zod schemas

### 3. Security

- **Server Actions**: All mutations go through server-side validation
- **Role-based Access**: Proper permission checking for admin/partner operations
- **Firebase Rules**: Firestore and Storage rules for additional security

## Key Components

### Authentication System

**Client-side Hook**: `useAuth()` from `hooks/use-auth-client.tsx`
- Manages authentication state
- Provides login/logout functions
- Fetches user profile data

**Server Actions**: `lib/actions/auth.ts`
- User creation (admin only)
- Permission management
- User status management

### Submission Management

**Client-side Hook**: `useSubmission()` from `hooks/use-submission-client.tsx`
- Real-time submission data
- File upload/removal
- Optimistic UI updates

**Server Actions**: `lib/actions/submissions.ts`
- Data validation and persistence
- Status updates
- Timeline management

### Data Validation

**Schemas**: `lib/schemas/index.ts`
- `CompanyInfoSchema`: Company information validation
- `ComplianceSchema`: Compliance data validation
- `SecuritySchema`: Security information validation
- `OnboardingSubmissionSchema`: Complete submission validation
- `UserProfileSchema`: User profile validation

## Firebase Configuration

### Client-side (`lib/firebase/client.ts`)
```typescript
// Firebase Web SDK for client operations
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Server-side (`lib/firebase/admin.ts`)
```typescript
// Firebase Admin SDK for server operations
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
```

## Development Workflow

### Code Quality

1. **ESLint**: Strict TypeScript linting rules
2. **Prettier**: Consistent code formatting
3. **TypeScript**: Strict type checking
4. **Pre-commit Hooks**: Automated linting and formatting

### Testing

1. **Jest**: Unit and integration testing
2. **Testing Library**: React component testing
3. **Coverage**: Minimum 70% coverage requirement

### Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

## Security Considerations

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
- Users can only access their own data
- Admins have full access to all collections
- Submissions cannot be deleted by clients

**Storage Rules** (`storage.rules`):
- Users can only upload to their own submission folders
- File size and type restrictions
- Admin access to all files

### Server-side Validation

All data mutations go through server actions with:
- Zod schema validation
- Authentication checks
- Authorization verification
- Audit trail logging

## Performance Optimizations

### Real-time Updates
- Firestore listeners for live data
- Optimistic UI updates
- Efficient re-rendering with React hooks

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features

### Caching
- Next.js built-in caching
- Firebase offline persistence
- Browser caching for static assets

## Deployment

### Environment Variables

Required environment variables:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY=
```

### Build Process

1. Type checking
2. ESLint validation
3. Test execution
4. Next.js build
5. Firebase deployment

## Migration Notes

### From Legacy Architecture

1. **Firebase Separation**: Split client and server Firebase configurations
2. **Server Actions**: Migrated mutations to server actions
3. **Type Safety**: Added comprehensive Zod schemas
4. **Hook Refactoring**: Updated hooks to use new Firebase structure
5. **Code Quality**: Implemented strict linting and formatting rules

### Breaking Changes

- Import paths changed for Firebase configurations
- Hook APIs updated for better type safety
- Server actions replace direct Firebase calls
- Stricter TypeScript configuration

## Future Enhancements

1. **Email Notifications**: Automated email system
2. **Document Validation**: AI-powered document verification
3. **Audit Trails**: Comprehensive logging system
4. **Performance Monitoring**: Real-time performance tracking
5. **Advanced Analytics**: Business intelligence dashboard