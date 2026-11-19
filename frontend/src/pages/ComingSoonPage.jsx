import { Hammer } from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";

export default function ComingSoonPage({ title }) {
  return (
    <div className="flex flex-1 items-center px-4 py-16">
      <EmptyState icon={Hammer} title={title} message="This page is being built in an upcoming phase.">
        <Button to="/" variant="outline">Back to home</Button>
      </EmptyState>
    </div>
  );
}