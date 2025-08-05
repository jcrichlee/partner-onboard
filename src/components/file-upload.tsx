
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
import { type OnboardingFile } from "@/lib/firestore";
import { type FileUpload as FileUploadType, type EnhancedFileUpload } from "@/lib/schemas";
import { type OnboardingFile as OnboardingFileSteps } from "@/lib/schemas/onboarding-steps";

type FileUploadProps = {
  id: string;
  label: string;
  category: string;
  description?: string;
  tooltip?: string;
  templateUrl?: string;
  multiple?: boolean;
  existingFiles?: (OnboardingFile | FileUploadType | EnhancedFileUpload | OnboardingFileSteps)[];
};

export function FileUpload({
  id,
  label,
  category: _category,
  description,
  tooltip,
  templateUrl,
  multiple = false,
  existingFiles = [],
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, setValue, watch, getValues } = useFormContext();
  const { removeFile } = useSubmission();

  // Register the field with react-hook-form
  register(id);
  
  // Watch for changes in the local file list for this input
  const localFiles = (watch(id) as File[]) || [];


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    setError(null);
    const newFiles = Array.from(event.target.files);
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Validation
    for (const file of newFiles) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Only PDF files are allowed.' });
        return;
      }
       if (file.size > MAX_SIZE_BYTES) {
        setError(`File size cannot exceed ${MAX_SIZE_MB}MB.`);
        toast({ variant: 'destructive', title: 'File Too Large', description: `Each file must be smaller than ${MAX_SIZE_MB}MB.` });
        return;
      }
    }

    const currentFiles = getValues(id) || [];
    const allFiles = multiple ? [...currentFiles, ...newFiles] : newFiles;
    setValue(id, allFiles, { shouldValidate: true, shouldDirty: true });

    event.target.value = ""; // Clear the input to allow re-uploading the same file
  };
  
  const removeLocalFile = (index: number) => {
    const currentFiles = watch(id) || [];
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    setValue(id, updatedFiles, { shouldValidate: true, shouldDirty: true });
  }

  const handleRemoveExistingFile = async (file: OnboardingFile | FileUploadType | EnhancedFileUpload | OnboardingFileSteps) => {
    await removeFile(file as FileUploadType | OnboardingFileSteps);
  };

  const showUploadField = multiple || (localFiles.length === 0 && existingFiles.length === 0);

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-base font-medium">
            {label}
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
                  error ? "border-destructive" : "border-gray-300"
                )}
              >
                <span className="flex items-center space-x-2">
                  <UploadCloud className="w-6 h-6 text-gray-600" />
                  <span className="font-medium text-gray-600">
                    Drop PDF to Attach, or{' '}
                    <span className="text-primary underline">browse</span>
                  </span>
                </span>
                <Input
                  id={id}
                  type="file"
                  accept=".pdf"
                  multiple={multiple}
                  onChange={handleFileChange}
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLocalFile(index)}
                  className="h-6 w-6 shrink-0"
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
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 overflow-hidden hover:underline">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExistingFile(file)}
                  className="h-6 w-6 shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
