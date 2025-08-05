"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Download, File as FileIcon, HelpCircle, Trash2, UploadCloud } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFormContext } from "react-hook-form";
import { useSubmission } from "@/hooks/use-submission-client";
import { type OnboardingFile } from "@/lib/schemas/onboarding-steps";

type EnhancedFileUploadProps = {
  id: string;
  label: string;
  category: string;
  description?: string;
  tooltip?: string;
  templateUrl?: string;
  multiple?: boolean;
  required?: boolean;
  existingFiles?: OnboardingFile[];
  accept?: string;
  maxSizeMB?: number;
};

/**
 * Enhanced File Upload Component
 * Implements the globally accepted approach from ONBOARDSTEPS.md:
 * - Firebase Storage structure: [UserEmail]/[CompanyName]/[StepName]/[FieldName]/file(s)
 * - File renaming using field labels
 * - Support for multiple file uploads where required
 * - Proper validation (file size, type)
 * - Progress indicators and error handling
 */
export function EnhancedFileUpload({
  id,
  label,
  category,
  description,
  tooltip,
  templateUrl,
  multiple = false,
  required = false,
  existingFiles = [],
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
}: EnhancedFileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { register, setValue, watch, getValues } = useFormContext();
  const { removeFile, addFile, submission } = useSubmission();

  // Register the field with react-hook-form
  register(id);
  
  // Watch for changes in the local file list for this input
  const localFiles = (watch(id) as File[]) || [];

  /**
   * Validates file according to ONBOARDSTEPS.md specifications:
   * - File size <= 300KB (or custom maxSizeMB)
   * - File type: Only PDF, JPG, JPEG, PNG allowed
   */
  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size cannot exceed ${maxSizeMB}MB.`;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPG, JPEG, and PNG files are allowed.';
    }

    return null;
  };

  /**
   * Generates the proper Firebase storage path according to ONBOARDSTEPS.md:
   * [UserEmail]/[CompanyName]/[StepName]/[FieldName]/file(s)
   */
  const generateStoragePath = (fileName: string): string => {
    if (!submission) return '';
    
    const userEmail = submission.partnerEmail || 'unknown';
    const companyName = submission.companyName || 'unknown-company';
    const stepName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fieldName = id.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Normalize filename: fieldname_1.extension
    const fileExtension = fileName.split('.').pop();
    const normalizedFileName = `${fieldName}_${Date.now()}.${fileExtension}`;
    
    return `${userEmail}/${companyName}/${stepName}/${fieldName}/${normalizedFileName}`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    setError(null);
    setUploading(true);
    const newFiles = Array.from(event.target.files);

    try {
      // Validate all files first
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          toast({ 
            variant: 'destructive', 
            title: 'Invalid File', 
            description: validationError 
          });
          setUploading(false);
          return;
        }
      }

      // Upload files to Firebase Storage
      const uploadPromises = newFiles.map(async (file) => {
        const storagePath = generateStoragePath(file.name);
        await addFile(file, category, id, storagePath);
      });

      await Promise.all(uploadPromises);

      // Update form state
      const currentFiles = getValues(id) || [];
      const allFiles = multiple ? [...currentFiles, ...newFiles] : newFiles;
      setValue(id, allFiles, { shouldValidate: true, shouldDirty: true });

      toast({
        title: 'Upload Successful',
        description: `${newFiles.length} file(s) uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload files. Please try again.',
      });
    } finally {
      setUploading(false);
      event.target.value = ""; // Clear the input
    }
  };
  
  const removeLocalFile = (index: number) => {
    const currentFiles = watch(id) || [];
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    setValue(id, updatedFiles, { shouldValidate: true, shouldDirty: true });
  };

  const handleRemoveExistingFile = async (file: OnboardingFile) => {
    try {
      await removeFile(file);
      toast({
        title: 'File Removed',
        description: 'File has been successfully removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Remove Failed',
        description: 'Failed to remove file. Please try again.',
      });
    }
  };

  const showUploadField = multiple || (localFiles.length === 0 && existingFiles.length === 0);
  const hasFiles = localFiles.length > 0 || existingFiles.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-base font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        <div className="flex items-start gap-4">
          {showUploadField && (
            <div className="relative flex-1">
              <label
                htmlFor={id}
                className={cn(
                  "flex justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary/80 focus-within:border-primary",
                  error ? "border-destructive" : "border-gray-300",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="flex items-center space-x-2">
                  <UploadCloud className={cn(
                    "w-6 h-6 text-gray-600",
                    uploading && "animate-pulse"
                  )} />
                  <span className="font-medium text-gray-600">
                    {uploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        Drop files to attach, or{' '}
                        <span className="text-primary underline">browse</span>
                      </>
                    )}
                  </span>
                </span>
                <Input
                  id={id}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 z-10 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
                />
              </label>
            </div>
          )}
          
          {templateUrl && (
            <Button
              variant="outline"
              asChild
              className="rounded-xl shadow-md shrink-0"
            >
              <a href={templateUrl} download>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </a>
            </Button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        {/* Display locally attached files */}
        {localFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">New files to upload:</p>
            {localFiles.map((file: File, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLocalFile(index)}
                  className="h-6 w-6 shrink-0"
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Display existing uploaded files */}
        {existingFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Uploaded files:</p>
            {existingFiles.map((file) => (
              <div
                key={file.storagePath}
                className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm"
              >
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 overflow-hidden hover:underline"
                >
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                  {file.size && (
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExistingFile(file)}
                  className="h-6 w-6 shrink-0"
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* File count indicator for multiple uploads */}
        {multiple && hasFiles && (
          <p className="text-xs text-muted-foreground">
            {existingFiles.length + localFiles.length} file(s) selected
            {multiple && " (multiple files allowed)"}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}