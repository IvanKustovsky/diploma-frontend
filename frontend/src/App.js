// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import SignUp from "./pages/SignUp/SignUp";
import Layout from "./components/ui/Layout";
import LogIn from "./pages/Login/LogIn";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;