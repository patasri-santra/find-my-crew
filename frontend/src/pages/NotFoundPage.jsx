import { SearchX } from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center px-4 py-16">
      <EmptyState icon={SearchX} title="Page not found" message="That page doesn't exist or has moved.">
        <Button to="/">Back to home</Button>
      </EmptyState>
    </div>
  );
}