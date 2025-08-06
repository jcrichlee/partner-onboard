import { z } from "zod";

// File validation schema for onboarding
export const OnboardingFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  storagePath: z.string(),
  category: z.string(),
  fieldName: z.string(),
  uploadedAt: z.string(),
  size: z.number().optional(),
});

// STEP 1: Company Incorporation & Legal Status
export const CompanyIncorporationSchema = z.object({
  // Text fields
  companyWebsite: z.string().url("Please enter a valid website URL").optional(),
  companyName: z.string().min(1, "Company name is required"),
  companyDescription: z.string().min(1, "Company description is required"),
  
  // File fields (handled separately by FileUpload components)
  certificateOfIncorporation: z.array(z.instanceof(File)).optional(),
  memorandumAndArticles: z.array(z.instanceof(File)).optional(),
  cacStatusReport: z.array(z.instanceof(File)).optional(),
  shareholdingDocuments: z.array(z.instanceof(File)).optional(),
  directorsAndShareholdersIds: z.array(z.instanceof(File)).optional(),
});

// STEP 2: Management & Key Personnel
export const ManagementPersonnelSchema = z.object({
  seniorManagementDetails: z.array(z.instanceof(File)).optional(),
  complianceOfficerId: z.array(z.instanceof(File)).optional(),
  complianceOfficerContact: z.string().optional(),
});

// STEP 3: Licensing & Regulatory Certification
export const LicensingRegulatorySchema = z.object({
  imtoRegulatoryLicense: z.array(z.instanceof(File)).optional(),
  ndprCertification: z.array(z.instanceof(File)).optional(),
  dataProtectionFiling: z.array(z.instanceof(File)).optional(),
  regulatoryQuestionnaires: z.array(z.instanceof(File)).optional(),
});

// STEP 4: Policies & Governance
export const PoliciesGovernanceSchema = z.object({
  amlCftCpfPolicy: z.array(z.instanceof(File)).optional(),
  kycPolicy: z.array(z.instanceof(File)).optional(),
  antiCorruptionPolicy: z.array(z.instanceof(File)).optional(),
  sterlingBankAbcStatement: z.array(z.instanceof(File)).optional(),
});

// STEP 5: Business Address Verification
export const BusinessAddressSchema = z.object({
  businessAddressEvidence: z.array(z.instanceof(File)).optional(),
});

// STEP 6: Information & Cyber Security Compliance
export const SecurityComplianceSchema = z.object({
  iso27001Certification: z.array(z.instanceof(File)).optional(),
  iso27032Certification: z.array(z.instanceof(File)).optional(),
  iso27017Certification: z.array(z.instanceof(File)).optional(),
  iso22301Certification: z.array(z.instanceof(File)).optional(),
});

// STEP 7: Monitoring, Risk, and International Sanctions
export const MonitoringRiskSchema = z.object({
  fraudMonitoringCapability: z.array(z.instanceof(File)).optional(),
  sanctionedCountriesDisclosure: z.enum(["yes", "no"], {
    required_error: "Sanctioned countries disclosure is required"
  }),
  pepDeclaration: z.enum(["yes", "no"], {
    required_error: "PEP declaration is required"
  }),
  pepDetails: z.string().optional(),
});

// Complete onboarding schema combining all steps
export const CompleteOnboardingSchema = z.object({
  step1: CompanyIncorporationSchema,
  step2: ManagementPersonnelSchema,
  step3: LicensingRegulatorySchema,
  step4: PoliciesGovernanceSchema,
  step5: BusinessAddressSchema,
  step6: SecurityComplianceSchema,
  step7: MonitoringRiskSchema,
});

// Onboarding step configuration
export const ONBOARDING_STEPS = [
  {    id: 'company-info',    title: 'Company Information',    description: 'Critical for verifying legal existence and shareholding structure',    schema: CompanyIncorporationSchema,    route: '/onboarding/company-info',
    fields: [
      {
        id: 'companyWebsite',
        label: 'Company Website',
        type: 'url' as const,
        required: false,
      },
      {
        id: 'companyName',
        label: 'Company Name',
        type: 'text' as const,
        required: true,
      },
      {
        id: 'companyDescription',
        label: 'Company Description',
        type: 'textarea' as const,
        required: true,
      },
      {
        id: 'certificateOfIncorporation',
        label: 'Certificate of Incorporation',
        type: 'file' as const,
        multiple: false,
        category: 'Company Incorporation & Legal Status',
        description: 'Upload the official certificate of incorporation',
      },
      {
        id: 'memorandumAndArticles',
        label: 'Memorandum and Articles of Association',
        type: 'file' as const,
        multiple: false,
        category: 'Company Incorporation & Legal Status',
        description: 'Upload your company\'s M&A',
      },
      {
        id: 'cacStatusReport',
        label: 'CAC Status Report (not older than 3 months)',
        type: 'file' as const,
        multiple: false,
        category: 'Company Incorporation & Legal Status',
        description: 'Upload the latest Corporate Affairs Commission status report',
      },
      {
        id: 'shareholdingDocuments',
        label: 'Shareholding Documents',
        type: 'file' as const,
        multiple: true,
        category: 'Company Incorporation & Legal Status',
        description: 'Upload IDs + Incorporation docs of any shareholder owning >5%',
      },
      {
        id: 'directorsAndShareholdersIds',
        label: 'IDs & BVNs of Directors and >5% Shareholders',
        type: 'file' as const,
        multiple: true,
        category: 'Company Incorporation & Legal Status',
        description: 'Upload identification documents and BVNs',
      },
    ],
  },
  {
    id: 'management-personnel',
    title: 'Management & Key Personnel',
    description: 'Information about senior management and compliance officers',
    schema: ManagementPersonnelSchema,
    route: '/onboarding/management-personnel',
    fields: [
      {
        id: 'seniorManagementDetails',
        label: 'Senior Management Details',
        type: 'file' as const,
        multiple: true,
        category: 'Management & Key Personnel',
        description: 'Upload names, positions, and identification documents',
      },
      {
        id: 'complianceOfficerId',
        label: 'Compliance Officer ID',
        type: 'file' as const,
        multiple: false,
        category: 'Management & Key Personnel',
        description: 'Upload compliance officer identification',
      },
      {
        id: 'complianceOfficerContact',
        label: 'Compliance Officer Contact',
        type: 'text' as const,
        required: false,
      },
    ],
  },
  {
    id: 'licensing-regulatory',
    title: 'Licensing & Regulatory Certification',
    description: 'Required licenses and regulatory certifications',
    schema: LicensingRegulatorySchema,
    route: '/onboarding/licensing-regulatory',
    fields: [
      {
        id: 'imtoRegulatoryLicense',
        label: 'IMTO Regulatory License',
        type: 'file' as const,
        multiple: true,
        category: 'Licensing & Regulatory Certification',
        description: 'Upload both original license and most recent renewal',
      },
      {
        id: 'ndprCertification',
        label: 'Nigerian Data Protection Regulatory Certification (NDPR 2024/2025)',
        type: 'file' as const,
        multiple: false,
        category: 'Licensing & Regulatory Certification',
        description: 'Upload NDPR certification',
      },
      {
        id: 'dataProtectionFiling',
        label: 'Evidence of Data Protection Filing (NDP Commission)',
        type: 'file' as const,
        multiple: false,
        category: 'Licensing & Regulatory Certification',
        description: 'Upload compliance badge or related document',
      },
      {
        id: 'regulatoryQuestionnaires',
        label: 'Regulatory Questionnaires',
        type: 'file' as const,
        multiple: true,
        category: 'Licensing & Regulatory Certification',
        description: 'Duly filled Financial Crimes Questionnaire and signed FCCQ by MLRO (PDF only)',
      },
    ],
  },
  {
    id: 'policies-governance',
    title: 'Policies & Governance',
    description: 'Required policies and governance documents',
    schema: PoliciesGovernanceSchema,
    route: '/onboarding/policies-governance',
    fields: [
      {
        id: 'amlCftCpfPolicy',
        label: 'AML/CFT/CPF Policy',
        type: 'file' as const,
        multiple: false,
        category: 'Policies & Governance',
        description: 'Upload your AML/CFT/CPF policy document',
      },
      {
        id: 'kycPolicy',
        label: 'KYC Policy',
        type: 'file' as const,
        multiple: false,
        category: 'Policies & Governance',
        description: 'Upload your KYC policy document',
      },
      {
        id: 'antiCorruptionPolicy',
        label: 'Anti-Bribery and Corruption (ABC) Policy',
        type: 'file' as const,
        multiple: false,
        category: 'Policies & Governance',
        description: 'Upload your ABC policy document',
      },
      {
        id: 'sterlingBankAbcStatement',
        label: 'Signed Sterling Bank ABC Statement',
        type: 'file' as const,
        multiple: false,
        category: 'Policies & Governance',
        description: 'Upload signed Sterling Bank ABC statement',
      },
    ],
  },
  {
    id: 'business-address',
    title: 'Business Address Verification',
    description: 'Verification of business address',
    schema: BusinessAddressSchema,
    route: '/onboarding/business-address',
    fields: [
      {
        id: 'businessAddressEvidence',
        label: 'Evidence of Business Address',
        type: 'file' as const,
        multiple: false,
        category: 'Business Address Verification',
        description: 'Notarized copy required for foreign entities',
      },
    ],
  },
  {
    id: 'security-compliance',
    title: 'Information & Cyber Security Compliance',
    description: 'Security certifications (optional)',
    schema: SecurityComplianceSchema,
    route: '/onboarding/security-compliance',
    fields: [
      {
        id: 'iso27001Certification',
        label: 'Information Security - ISO 27001/27002 Certification',
        type: 'file' as const,
        multiple: false,
        category: 'Information & Cyber Security Compliance',
        description: 'Upload ISO 27001/27002 certification (optional)',
        required: false,
      },
      {
        id: 'iso27032Certification',
        label: 'Cyber Security - ISO 27032 Certification',
        type: 'file' as const,
        multiple: false,
        category: 'Information & Cyber Security Compliance',
        description: 'Upload ISO 27032 certification (optional)',
        required: false,
      },
      {
        id: 'iso27017Certification',
        label: 'Cloud Security - ISO 27017 Certification',
        type: 'file' as const,
        multiple: false,
        category: 'Information & Cyber Security Compliance',
        description: 'Upload ISO 27017 certification (optional)',
        required: false,
      },
      {
        id: 'iso22301Certification',
        label: 'Business Continuity - ISO 22301 Certification',
        type: 'file' as const,
        multiple: false,
        category: 'Information & Cyber Security Compliance',
        description: 'Upload ISO 22301 certification (optional)',
        required: false,
      },
    ],
  },
  {
    id: 'monitoring-risk',
    title: 'Monitoring, Risk, and International Sanctions',
    description: 'Risk monitoring and sanctions compliance',
    schema: MonitoringRiskSchema,
    route: '/onboarding/monitoring-risk',
    fields: [
      {
        id: 'fraudMonitoringCapability',
        label: 'Fraud & Suspicious Transaction Monitoring Capability',
        type: 'file' as const,
        multiple: false,
        category: 'Monitoring, Risk, and International Sanctions',
        description: 'Upload documents confirming fraud monitoring solution and suspicious transaction reporting capability',
      },
      {
        id: 'sanctionedCountriesDisclosure',
        label: 'Sanctioned Countries Disclosure',
        type: 'radio' as const,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        description: 'Do you conduct business with DPRK, Iran, Myanmar?',
        required: true,
      },
      {
        id: 'pepDeclaration',
        label: 'PEP Declaration',
        type: 'radio' as const,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        description: 'Are any UBOs or Board Members PEPs?',
        required: true,
      },
      {
        id: 'pepDetails',
        label: 'PEP Details',
        type: 'textarea' as const,
        description: 'If applicable, describe their role in the company and level of influence',
        required: false,
        condition: (_values: any) => _values.pepDeclaration === 'yes',
      },
    ],
  },
] as const;

// Type exports
export type CompanyIncorporation = z.infer<typeof CompanyIncorporationSchema>;
export type ManagementPersonnel = z.infer<typeof ManagementPersonnelSchema>;
export type LicensingRegulatory = z.infer<typeof LicensingRegulatorySchema>;
export type PoliciesGovernance = z.infer<typeof PoliciesGovernanceSchema>;
export type BusinessAddress = z.infer<typeof BusinessAddressSchema>;
export type SecurityCompliance = z.infer<typeof SecurityComplianceSchema>;
export type MonitoringRisk = z.infer<typeof MonitoringRiskSchema>;
export type CompleteOnboarding = z.infer<typeof CompleteOnboardingSchema>;
export type OnboardingFile = z.infer<typeof OnboardingFileSchema>;

// Field type definitions
export type FieldType = 'text' | 'textarea' | 'url' | 'file' | 'radio';

export interface OnboardingField {
  id: string;
  label: string;
  type: FieldType;
  multiple?: boolean;
  category?: string;
  description?: string;
  required?: boolean;
  options?: readonly { readonly value: string; readonly label: string }[];
  condition?: (_values: any) => boolean;
  tooltip?: string;
  templateUrl?: string;
  accept?: string;
  maxSizeMB?: number;
  multiline?: boolean;
  placeholder?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  schema: z.ZodSchema;
  route: string;
  fields: readonly OnboardingField[];
}

// Additional type definitions for the onboarding system
export type OnboardingStepConfig = OnboardingStep;
export type OnboardingStepData = Record<string, any>;