import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import SignUp from "./pages/SignUp/SignUp";
import Layout from "./components/ui/Layout";
import LogIn from "./pages/Login/LogIn";
import EquipmentsPage from "./pages/Equipments/EquipmentsPage";
import EquipmentDetailsPage from "./pages/Equipments/EquipmentDetailsPage";
import UploadEquipmentPage from "./pages/Equipments/UploadEquipmentPage";
import { AuthProvider } from "./context/AuthContext";
import MyEquipmentsPage from "./pages/Equipments/MyEquipmentsPage";
import EditEquipmentPage from "./pages/Equipments/EditEquipmentPage";

function App() {
  return (
    <Router>
      <AuthProvider> {/* 🔐 Обгортаємо всі компоненти, які потребують доступу до auth */}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/equipments" element={<EquipmentsPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
            <Route path="/equipment/:id/edit" element={<EditEquipmentPage />} />
            <Route path="/equipment/upload" element={<UploadEquipmentPage />} /> 
            <Route path="/my-equipments" element={<MyEquipmentsPage />} /> 
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
