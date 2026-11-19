import { BookOpen, Camera, Code, Coffee, Compass, Dumbbell, Film, Sparkles, Trophy } from "lucide-react";

// Keep in sync with CATEGORIES in backend/models/Activity.js
export const CATEGORIES = [
  { name: "Sports", icon: Trophy },
  { name: "Food and Cafes", icon: Coffee },
  { name: "Travel and Exploration", icon: Compass },
  { name: "Study Groups", icon: BookOpen },
  { name: "Technology and Coding", icon: Code },
  { name: "Photography", icon: Camera },
  { name: "Fitness", icon: Dumbbell },
  { name: "Entertainment", icon: Film },
  { name: "Other", icon: Sparkles },
];

export const getCategoryIcon = (name) => CATEGORIES.find((c) => c.name === name)?.icon || Sparkles;