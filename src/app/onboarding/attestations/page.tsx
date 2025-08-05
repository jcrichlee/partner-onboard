import { AttestationsForm } from "@/components/attestations-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default function AttestationsPage() {
  return (
    <Card className="max-w-4xl mx-auto rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Step 4: Attestations</CardTitle>
        <CardDescription>
          Please download the required documents, sign them, and upload the
          completed versions. Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <AttestationsForm />
    </Card>
  );
}
