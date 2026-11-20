import { useForm } from "react-hook-form";
import Button from "../common/Button";
import FormField from "../common/FormField";

const parseInterests = (text) =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProfileForm({ initialValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialValues });

  const bioLength = watch("bio")?.length || 0;

  const submit = (values) =>
    onSubmit({
      name: values.name.trim(),
      bio: values.bio.trim(),
      locationLabel: values.locationLabel.trim(),
      interests: parseInterests(values.interests),
    });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4 text-left">
      <FormField
        label="Full name"
        id="name"
        error={errors.name}
        maxLength={50}
        registration={register("name", {
          required: "Name is required",
          validate: (v) => v.trim().length >= 2 || "Name must be at least 2 characters",
        })}
      />
      <FormField
        label="Bio"
        id="bio"
        as="textarea"
        rows={3}
        maxLength={300}
        error={errors.bio}
        hint={`${bioLength}/300 characters`}
        placeholder="A line or two about what you're into"
        registration={register("bio")}
      />
      <FormField
        label="Location"
        id="locationLabel"
        maxLength={80}
        error={errors.locationLabel}
        placeholder="e.g. New Delhi"
        hint="A city or area, never your home address."
        registration={register("locationLabel")}
      />
      <FormField
        label="Interests"
        id="interests"
        error={errors.interests}
        placeholder="Badminton, Photography, Coding"
        hint="Separate with commas. Up to 10."
        registration={register("interests", {
          validate: (value) => {
            const items = parseInterests(value);
            if (items.length > 10) return "Up to 10 interests";
            if (items.some((item) => item.length < 2 || item.length > 30)) {
              return "Each interest must be 2-30 characters";
            }
            return true;
          },
        })}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}