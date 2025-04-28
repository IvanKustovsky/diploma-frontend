import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Layout
import Layout from "./components/ui/Layout";

// Auth Context
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./pages/Home/HomePage";
import SignUp from "./pages/SignUp/SignUp";
import LogIn from "./pages/Login/LogIn";
import EquipmentsPage from "./pages/Equipments/EquipmentsPage";
import EquipmentDetailsPage from "./pages/Equipments/EquipmentDetailsPage";
import UploadEquipmentPage from "./pages/Equipments/UploadEquipmentPage";
import MyEquipmentsPage from "./pages/Equipments/MyEquipmentsPage";
import EditEquipmentPage from "./pages/Equipments/EditEquipmentPage";
import UserEquipmentsPage from "./pages/Equipments/UserEquipmentsPage";
import UserDetailsPage from "./pages/Users/UserDetailsPage";
import Moderation from "./pages/Moderation/Moderation";
import AdvertisementModerationPage from "./pages/Moderation/AdvertisementModerationPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Protected Route
import ProtectedRoute from "./components/ui/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/equipments" element={<EquipmentsPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
            <Route path="/user-equipments" element={<UserEquipmentsPage />} />

            <Route
              path="/equipment/:id/edit"
              element={
                <ProtectedRoute>
                  <EditEquipmentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/upload"
              element={
                <ProtectedRoute>
                  <UploadEquipmentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-equipments"
              element={
                <ProtectedRoute>
                  <MyEquipmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-profile"
              element={
                <ProtectedRoute>
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/moderation"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Moderation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/moderation/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdvertisementModerationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;