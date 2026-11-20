import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2, Trash2 } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import useImageUpload from "../../hooks/useImageUpload";
import { updateProfileImage } from "../../services/userService";

export default function AvatarUpload({ user, onUserUpdated }) {
  const inputRef = useRef(null);
  const { uploading, upload } = useImageUpload();
  const [saving, setSaving] = useState(false);
  const busy = uploading || saving;

  // profileImage "" removes the photo
  const save = async (profileImage) => {
    setSaving(true);
    try {
      const { data } = await updateProfileImage(profileImage);
      onUserUpdated(data.user);
      toast.success(profileImage ? "Photo updated" : "Photo removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update your photo");
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    const url = await upload(file);
    if (url) await save(url);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar user={user} size="lg" />
        {busy && (
          <div role="status" aria-label="Updating photo" className="absolute inset-0 grid place-items-center rounded-full bg-white/70">
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="sr-only"
        aria-label="Choose profile photo"
        tabIndex={-1}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current.click()} disabled={busy}>
          <Camera size={16} /> {user.profileImage ? "Change photo" : "Add photo"}
        </Button>
        {user.profileImage && (
          <Button variant="outline" onClick={() => save("")} disabled={busy} aria-label="Remove photo">
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}