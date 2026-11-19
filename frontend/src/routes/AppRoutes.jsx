import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ComingSoonPage from "../pages/ComingSoonPage";
import NotFoundPage from "../pages/NotFoundPage";
import ExplorePage from "../pages/ExplorePage";
import ProtectedRoute from "./ProtectedRoute";
import ActivityDetailsPage from "../pages/ActivityDetailsPage";
import CreateActivityPage from "../pages/CreateActivityPage";
import MyActivitiesPage from "../pages/MyActivitiesPage";
import EditActivityPage from "../pages/EditActivityPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/activities/:id" element={<ActivityDetailsPage />} />
        <Route path="/profile/:id" element={<ComingSoonPage title="Profile" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-activity" element={<CreateActivityPage />} />
          <Route path="/my-activities" element={<MyActivitiesPage />} />
          <Route path="/activities/:id/edit" element={<EditActivityPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}