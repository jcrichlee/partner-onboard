import { SecurityForm } from "@/components/security-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SecurityPage() {
  return (
    <Card className="max-w-4xl mx-auto rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">
          Step 3: Security &amp; Governance
        </CardTitle>
        <CardDescription>
          Upload your information security policies, certificates, and provide
          governance details. Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <SecurityForm />
    </Card>
  );
}
