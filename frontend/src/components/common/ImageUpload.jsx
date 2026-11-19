import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadImage } from "../../services/uploadService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

export default function ImageUpload({ value, onChange, onUploadingChange, label = "Cover image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const setBusy = (busy) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const handleFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // so picking the same file again still fires
    if (!file) return;

    // Quick checks for a friendly message; the server validates again
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_MB} MB or smaller`);
      return;
    }

    setBusy(true);
    try {
      const { data } = await uploadImage(file);
      onChange(data.url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed, please try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label} (optional)</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="sr-only"
        aria-label={label}
        tabIndex={-1}
      />

      <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white">
        {value ? (
          <>
            <img src={value} alt="Cover preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-white"
            >
              <Trash2 size={14} /> Remove
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm font-semibold text-ink/70 outline-none transition hover:bg-peach/40 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ImagePlus size={28} className="text-primary" />
            Add a cover image
            <span className="text-xs font-normal">JPG, PNG or WebP, up to {MAX_MB} MB</span>
          </button>
        )}

        {uploading && (
          <div role="status" className="absolute inset-0 grid place-items-center bg-white/80">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Loader2 size={18} className="animate-spin" /> Uploading...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}