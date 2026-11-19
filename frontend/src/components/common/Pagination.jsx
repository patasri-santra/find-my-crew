import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Previous
      </Button>
      <span className="text-sm font-semibold">
        Page {page} of {pages}
      </span>
      <Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={16} />
      </Button>
    </nav>
  );
}