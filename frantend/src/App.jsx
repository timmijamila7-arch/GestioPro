import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Employees from "./Pages/Employees.jsx";
import Login from "./Pages/Login.jsx";
import AddEmployee from "./Pages/AddEmployee.jsx";
import Conges from "./Pages/Conges.jsx";
import Absences from "./Pages/Absences.jsx";
import Projets from "./Pages/Projets.jsx";
import Affectations from "./Pages/Affectations.jsx";
import api from "./api";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setStatus(res.data.role === "admin" ? "ok" : "forbidden"))
      .catch(() => setStatus("forbidden"));
  }, []);

  if (status === "loading") return null;
  if (status === "forbidden") return <Navigate to="/conges" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/conges" replace />} />

        <Route path="/conges" element={<PrivateRoute><Conges /></PrivateRoute>} />
        <Route path="/absences" element={<PrivateRoute><Absences /></PrivateRoute>} />
        <Route path="/projets" element={<PrivateRoute><Projets /></PrivateRoute>} />
        <Route path="/affectations" element={<PrivateRoute><Affectations /></PrivateRoute>} />

        <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
        <Route path="/create" element={<AdminRoute><AddEmployee /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
