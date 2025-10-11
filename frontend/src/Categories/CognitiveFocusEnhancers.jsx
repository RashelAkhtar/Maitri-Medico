import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function CognitiveFocusEnhancers() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">
          Cognitive & Focus Enhancers (Nootropics)
        </h1>
        <p className="appliances-subtitle">
          For improving concentration and mental clarity.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="cognitiveFocusEnhancers" />
      </div>
    </div>
  );
}

export default CognitiveFocusEnhancers;
