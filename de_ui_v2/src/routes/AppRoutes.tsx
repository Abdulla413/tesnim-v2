// src/routes/AppRoutes.tsx
import {Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Dialog from "../pages/Dialog"
import AddWordsPage from "../pages/AddWords";
import EditPage from "../pages/EditPage";
import Register from "../pages/Register";
import Login from "../pages/Login";
const AppRoutes = () => {
  return (
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/editpage/:id" element={<EditPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/dialog" element={<Dialog />} /> 
      <Route path="/addwords" element={<AddWordsPage />} /> 
    </Routes>
  );
};

export default AppRoutes;
