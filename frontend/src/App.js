import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import SignUp from "./pages/SignUp/SignUp";
import Layout from "./components/ui/Layout";
import LogIn from "./pages/Login/LogIn";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider> {/* 🔐 Обгортаємо всі компоненти, які потребують доступу до auth */}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
