import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../common/Button";
import FormField from "../common/FormField";
import ImageUpload from "../common/ImageUpload";
import LocationPicker from "./LocationPicker";
import { CATEGORIES } from "../../utils/categories";
import { todayInputValue } from "../../utils/formatDate";

const EMPTY_VALUES = {
  title: "",
  description: "",
  category: "",
  coverImage: "",
  date: "",
  startTime: "",
  endTime: "",
  address: "",
  coordinates: null,
  maxParticipants: "",
};

// date + time typed in the browser are in the user's own timezone
const toDateTime = (date, time) => new Date(`${date}T${time}`);

export default function ActivityForm({ initialValues = EMPTY_VALUES, onSubmit, submitLabel = "Publish activity" }) {
  const [uploading, setUploading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialValues });

  const descriptionLength = watch("description")?.length || 0;

  // Turn form values into the exact shape the API expects
  const submit = (values) =>
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      coverImage: values.coverImage,
      date: toDateTime(values.date, values.startTime).toISOString(),
      startTime: values.startTime,
      endTime: values.endTime,
      maxParticipants: values.maxParticipants,
      location: {
        address: values.address.trim(),
        latitude: values.coordinates.lat,
        longitude: values.coordinates.lng,
      },
    });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">The basics</h2>

        <FormField
          label="Activity title"
          id="title"
          error={errors.title}
          placeholder="e.g. Sunday badminton at the park"
          maxLength={100}
          registration={register("title", {
            required: "Title is required",
            validate: (v) => v.trim().length >= 3 || "Title must be at least 3 characters",
          })}
        />

        <FormField
          label="Category"
          id="category"
          as="select"
          error={errors.category}
          registration={register("category", { required: "Please choose a category" })}
        >
          <option value="">Choose a category</option>
          {CATEGORIES.map(({ name }) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </FormField>

        <FormField
          label="Description"
          id="description"
          as="textarea"
          rows={5}
          error={errors.description}
          hint={`${descriptionLength}/2000 characters`}
          maxLength={2000}
          placeholder="What will you do? Who is it for? What should people bring?"
          registration={register("description", {
            required: "Description is required",
            validate: (v) => v.trim().length >= 10 || "Description must be at least 10 characters",
          })}
        />
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">When</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            label="Date"
            id="date"
            type="date"
            min={todayInputValue()}
            error={errors.date}
            registration={register("date", { required: "Date is required" })}
          />
          <FormField
            label="Start time"
            id="startTime"
            type="time"
            error={errors.startTime}
            registration={register("startTime", {
              required: "Start time is required",
              validate: (value, formValues) =>
                !formValues.date ||
                toDateTime(formValues.date, value) > new Date() ||
                "Start must be in the future",
            })}
          />
          <FormField
            label="End time (optional)"
            id="endTime"
            type="time"
            error={errors.endTime}
            registration={register("endTime", {
              validate: (value, formValues) =>
                !value || !formValues.startTime || value > formValues.startTime || "End must be after start",
            })}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Where</h2>
        <FormField
          label="Location / address"
          id="address"
          error={errors.address}
          placeholder="e.g. Lodhi Garden, New Delhi"
          maxLength={200}
          hint="This is the text people will see. Drop the pin below to match it."
          registration={register("address", {
            required: "Address is required",
            validate: (v) => v.trim().length >= 3 || "Address must be at least 3 characters",
          })}
        />
        <Controller
          name="coordinates"
          control={control}
          rules={{ validate: (value) => Boolean(value) || "Drop a pin on the map" }}
          render={({ field, fieldState }) => (
            <LocationPicker value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
          )}
        />
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Cover image and capacity</h2>
        <Controller
          name="coverImage"
          control={control}
          render={({ field }) => (
            <ImageUpload value={field.value} onChange={field.onChange} onUploadingChange={setUploading} />
          )}
        />
        <FormField
          label="Maximum participants (including you)"
          id="maxParticipants"
          type="number"
          min={2}
          max={100}
          error={errors.maxParticipants}
          placeholder="e.g. 6"
          registration={register("maxParticipants", {
            valueAsNumber: true,
            required: "Maximum participants is required",
            validate: (v) => (Number.isInteger(v) && v >= 2 && v <= 100) || "Enter a whole number from 2 to 100",
          })}
        />
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting || uploading}>
          {uploading ? "Uploading image..." : isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}