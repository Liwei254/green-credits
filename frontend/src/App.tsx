import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* keep your existing routes below */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/submit" element={<SubmitAction />} /> */}
      {/* ... */}
    </Routes>
  );
}

export default App;
