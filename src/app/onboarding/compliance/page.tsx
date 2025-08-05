import { ComplianceForm } from "@/components/compliance-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompliancePage() {
  return (
    <Card className="max-w-4xl mx-auto rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">
          Step 2: Ownership &amp; Compliance
        </CardTitle>
        <CardDescription>
          Please provide your company's compliance documents and disclose any
          Politically Exposed Persons (PEPs). Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <ComplianceForm />
    </Card>
  );
}
