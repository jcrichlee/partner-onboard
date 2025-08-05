# IMTO Onboarding Platform - Global Implementation Guide

This document outlines the globally accepted onboarding approach implementation based on the specifications in `ONBOARDSTEPS.md`.

## Overview

The implementation provides a comprehensive, scalable onboarding system that follows the 7-step enhanced due diligence process outlined in the ONBOARDSTEPS.md specification.

## Architecture

### Core Components

#### 1. Schema Definition (`src/lib/schemas/onboarding-steps.ts`)
- **Purpose**: Centralized configuration for all 7 onboarding steps
- **Features**:
  - Zod validation schemas for each step
  - Field type definitions (text, URL, file, radio)
  - Conditional rendering logic
  - File upload specifications
  - Step metadata (titles, descriptions, routes)

#### 2. Dynamic Form Component (`src/components/dynamic-onboarding-form.tsx`)
- **Purpose**: Renders forms dynamically based on step schema
- **Features**:
  - Auto-generates form fields from schema
  - Handles validation and error display
  - Integrates with Firebase for data persistence
  - Supports conditional field rendering
  - Progress tracking and navigation

#### 3. Enhanced File Upload (`src/components/enhanced-file-upload.tsx`)
- **Purpose**: Handles file uploads with proper Firebase storage structure
- **Features**:
  - Follows `[UserEmail]/[CompanyName]/[StepName]/[FieldName]/file(s)` naming convention
  - Supports multiple file uploads
  - File validation (type, size)
  - Progress indicators
  - Error handling

#### 4. Onboarding Manager Hook (`src/hooks/use-onboarding-manager.tsx`)
- **Purpose**: Centralized state management for onboarding process
- **Features**:
  - Step navigation logic
  - Progress calculation
  - Data persistence
  - Real-time Firebase integration
  - Status tracking

#### 5. Progress Component (`src/components/onboarding-progress.tsx`)
- **Purpose**: Visual progress indicator and navigation
- **Features**:
  - Step status visualization
  - Progress percentage calculation
  - Navigation between accessible steps
  - Compact and full view modes
  - Responsive design

#### 6. Updated Submission Client (`src/hooks/use-submission-client.tsx`)
- **Purpose**: Enhanced Firebase integration
- **Features**:
  - Compatible with new onboarding schema
  - Proper file storage path generation
  - Backward compatibility with existing code
  - Real-time data synchronization

### File Structure

```
src/
├── lib/schemas/
│   ├── onboarding-steps.ts     # Step definitions and schemas
│   └── index.ts                # Updated with new types
├── components/
│   ├── dynamic-onboarding-form.tsx    # Dynamic form renderer
│   ├── enhanced-file-upload.tsx       # Enhanced file upload
│   └── onboarding-progress.tsx        # Progress indicator
├── hooks/
│   ├── use-onboarding-manager.tsx     # Centralized state management
│   └── use-submission-client.tsx      # Updated Firebase integration
└── app/onboarding/
    └── page.tsx                        # Main onboarding page
```

## Implementation Details

### 1. Seven Onboarding Steps

As specified in ONBOARDSTEPS.md:

1. **Company Incorporation**
   - Certificate of Incorporation
   - CAC Status Report
   - Memorandum & Articles of Association

2. **Management & Key Personnel**
   - Directors' details and documentation
   - Key personnel information
   - Organizational structure

3. **Licensing & Regulatory Certification**
   - IMTO License
   - Other relevant licenses
   - Regulatory compliance certificates

4. **Policies & Governance**
   - Corporate governance policies
   - Compliance frameworks
   - Risk management policies

5. **Business Address Verification**
   - Proof of business address
   - Utility bills
   - Lease agreements

6. **Information & Cyber Security Compliance**
   - Security policies
   - Audit reports
   - Compliance certifications

7. **Monitoring, Risk, and International Sanctions**
   - Risk assessment reports
   - Sanctions compliance
   - Monitoring procedures

### 2. Firebase Storage Structure

Files are stored following the specified naming convention:
```
[UserEmail]/[CompanyName]/[StepName]/[FieldName]/file(s)
```

Example:
```
john.doe@company.com/
├── ACME Corp/
│   ├── Company Incorporation/
│   │   ├── Certificate of Incorporation/
│   │   │   └── certificate.pdf
│   │   └── CAC Status Report/
│   │       └── cac_report.pdf
│   └── Management & Key Personnel/
│       └── Directors Details/
│           ├── director1.pdf
│           └── director2.pdf
```

### 3. Form Validation

Each step uses Zod schemas for validation:
- Required field validation
- File type and size validation
- URL format validation
- Custom business logic validation

### 4. Progress Tracking

The system tracks:
- Current step
- Completed steps
- Step status (pending, current, completed, error)
- Overall progress percentage
- Data persistence status

## Usage

### Basic Implementation

```tsx
import { DynamicOnboardingForm } from '@/components/dynamic-onboarding-form';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { useOnboardingManager } from '@/hooks/use-onboarding-manager';

function OnboardingPage() {
  const { currentStep, progress } = useOnboardingManager();

  return (
    <div className="grid grid-cols-4 gap-8">
      <OnboardingProgress />
      <DynamicOnboardingForm step={currentStep} />
    </div>
  );
}
```

### Custom Step Configuration

```tsx
// Add new step to ONBOARDING_STEPS array
const newStep: OnboardingStepConfig = {
  id: 'custom-step',
  title: 'Custom Step',
  description: 'Custom step description',
  schema: z.object({
    customField: z.string().min(1, 'Required')
  }),
  route: '/onboarding/custom',
  fields: [
    {
      name: 'customField',
      label: 'Custom Field',
      type: 'text',
      required: true
    }
  ]
};
```

## Migration Guide

### From Existing Implementation

1. **Update imports**:
   ```tsx
   // Old
   import { useSubmission } from '@/hooks/use-submission-client';
   
   // New (backward compatible)
   import { useSubmission } from '@/hooks/use-submission-client';
   import { useOnboardingManager } from '@/hooks/use-onboarding-manager';
   ```

2. **Replace static forms**:
   ```tsx
   // Old
   <CompanyInfoForm />
   
   // New
   <DynamicOnboardingForm step={currentStep} />
   ```

3. **Update progress components**:
   ```tsx
   // Old
   <OnboardingProgress /> // Static 4 steps
   
   // New
   <OnboardingProgress /> // Dynamic 7 steps
   ```

## Benefits

### 1. Scalability
- Easy to add/modify steps
- Centralized configuration
- Reusable components

### 2. Maintainability
- Single source of truth for step definitions
- Consistent validation logic
- Modular architecture

### 3. User Experience
- Real-time progress tracking
- Intuitive navigation
- Error handling and feedback

### 4. Compliance
- Follows ONBOARDSTEPS.md specifications
- Proper file organization
- Audit trail capabilities

### 5. Developer Experience
- Type-safe implementation
- Clear separation of concerns
- Comprehensive documentation

## Testing

### Unit Tests
```bash
# Test schema validation
npm test schemas

# Test form components
npm test components

# Test hooks
npm test hooks
```

### Integration Tests
```bash
# Test complete onboarding flow
npm test e2e
```

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
```

### Build
```bash
npm run build
npm start
```

## Support

For questions or issues:
1. Check the ONBOARDSTEPS.md specification
2. Review component documentation
3. Check Firebase console for data/storage issues
4. Contact the development team

## Future Enhancements

1. **Analytics Integration**
   - Step completion tracking
   - User behavior analysis
   - Performance metrics

2. **Advanced Validation**
   - Document verification APIs
   - Real-time compliance checking
   - Automated risk assessment

3. **Internationalization**
   - Multi-language support
   - Localized validation messages
   - Regional compliance variations

4. **Mobile Optimization**
   - Progressive Web App features
   - Offline capability
   - Mobile-specific UI patterns