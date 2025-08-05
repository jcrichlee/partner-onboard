import { z } from "zod";

// Company Information Schema
export const CompanyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  businessDescription: z.string().min(1, "Business description is required."),
  companyUrl: z.string().url("Please enter a valid URL."),
});

// Compliance Schema
export const ComplianceSchema = z.object({
  pepDisclosure: z.enum(["yes", "no"], {
    required_error: "PEP disclosure is required."
  }),
  pepDetails: z.string().optional(),
});

// Security Schema
export const SecuritySchema = z.object({
  hasComplianceOfficer: z.boolean(),
  hasSecurityAudits: z.boolean(),
});

// File Upload Schema
export const FileUploadSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  storagePath: z.string(),
  category: z.string(),
  fieldName: z.string(),
  uploadedAt: z.string(),
  size: z.number().optional(),
});

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "superadmin", "partner"]),
  stagePermissions: z.record(z.array(z.enum(["view", "comment"]))).optional(),
  canManageUsers: z.boolean().optional(),
  disabled: z.boolean().optional(),
  notifications: z.array(z.object({
    id: z.string(),
    message: z.string(),
    link: z.string(),
    read: z.boolean(),
    createdAt: z.string(),
  })).optional(),
});

// Enhanced File Upload Schema for new onboarding approach
export const EnhancedFileUploadSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  storagePath: z.string(),
  category: z.string(),
  fieldId: z.string(),
  uploadedAt: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
});

// Onboarding Submission Schema
export const OnboardingSubmissionSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  partnerName: z.string(),
  partnerEmail: z.string().email().optional(),
  status: z.enum([
    "draft",
    "in-progress", 
    "completed",
    "submitted",
    "under-review",
    "requires-attention",
    "approved",
    "rejected"
  ]),
  lastUpdated: z.string(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  currentStep: z.string().optional(),
  
  // New step-based structure
  steps: z.record(z.any()).optional(), // Dynamic step data
  
  timeline: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    actor: z.string(),
    date: z.string(),
    content: z.string(),
    category: z.string().optional(),
  })),
  files: z.array(z.union([FileUploadSchema, EnhancedFileUploadSchema])),
  chat: z.array(z.object({
    from: z.enum(["admin", "partner"]),
    text: z.string(),
    time: z.string(),
    category: z.string(),
    adminName: z.string().optional(),
    resolved: z.boolean().optional(),
    mentions: z.array(z.string()).optional(),
  })).optional(),
  sectionStatus: z.record(z.enum(["pending", "approved", "changesRequested"])).optional(),
  
  // Legacy step-specific fields (for backward compatibility)
  companyName: z.string().optional(),
  businessDescription: z.string().optional(),
  companyUrl: z.string().optional(),
  pepDisclosure: z.enum(["yes", "no"]).optional(),
  pepDetails: z.string().optional(),
  hasComplianceOfficer: z.boolean().optional(),
  hasSecurityAudits: z.boolean().optional(),
});

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// Create User Schema
export const CreateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "superadmin", "partner"]),
  canManageUsers: z.boolean().optional(),
});

// Dashboard Metrics Schema
export const DashboardMetricsSchema = z.object({
  totalPartners: z.number(),
  completedOnboards: z.number(),
  totalAdmins: z.number(),
  totalFileSize: z.number(),
});

// Type exports using z.infer
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type Compliance = z.infer<typeof ComplianceSchema>;
export type Security = z.infer<typeof SecuritySchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type EnhancedFileUpload = z.infer<typeof EnhancedFileUploadSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type OnboardingSubmission = z.infer<typeof OnboardingSubmissionSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

// Re-export from onboarding-steps for convenience
export { ONBOARDING_STEPS } from './onboarding-steps';
export type { 
  OnboardingStepConfig, 
  OnboardingStepData, 
  OnboardingFile,
  FieldType 
} from './onboarding-steps';