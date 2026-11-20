import { useEffect, useRef } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import useImageUpload from "../../hooks/useImageUpload";

export default function ImageUpload({ value, onChange, onUploadingChange, label = "Cover image" }) {
  const inputRef = useRef(null);
  const { uploading, upload } = useImageUpload();

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // so picking the same file again still fires
    const url = await upload(file);
    if (url) onChange(url);
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
            <span className="text-xs font-normal">JPG, PNG or WebP, up to 5 MB</span>
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