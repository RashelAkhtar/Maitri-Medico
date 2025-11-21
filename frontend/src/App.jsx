import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage";
import ProductShowcase from "./Components/ProductShowcasePage";
import Navbar from "./Components/Navbar";
import Cart from "./Components/Cart";
import Admin from "./Components/Admin";
import SuperAdmin from "./Components/SuperAdmin";

// Categories
import AntiAnxiety from "./Categories/Anti-Anxiety";
import Antidepressants from "./Categories/Antidepressants";
import Antipsychotics from "./Categories/Antipsychotics";
import CognitiveFocusEnhancers from "./Categories/CognitiveFocusEnhancers";
import MoodStabilizers from "./Categories/MoodStabilizers";
import NaturalHerbalMentalWellness from "./Categories/NaturalHerbalMentalWellness";
import SleepRelaxationAids from "./Categories/SleepRelaxationAids";
import VitaminsNutritionalSupport from "./Categories/VitaminsNutritionalSupport";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductShowcase />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/superadmin" element={<SuperAdmin />} />

          {/* Categories Routes */}
          <Route path="/products/antiAnxiety" element={<AntiAnxiety />} />
          <Route
            path="/products/antidepressants"
            element={<Antidepressants />}
          />
          <Route
            path="/products/moodStabilizers"
            element={<MoodStabilizers />}
          />
          <Route path="/products/antipsychotics" element={<Antipsychotics />} />
          <Route path="/products/v" element={<SleepRelaxationAids />} />
          <Route
            path="/products/cognitiveFocusEnhancers"
            element={<CognitiveFocusEnhancers />}
          />
          <Route
            path="/products/naturalHerbalMentalWellness"
            element={<NaturalHerbalMentalWellness />}
          />
          <Route
            path="/products/vitaminsNutritionalSupport"
            element={<VitaminsNutritionalSupport />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
