import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function VitaminsNutritionalSupport() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Vitamins & Nutritional Support</h1>
        <p className="appliances-subtitle">
          For brain health and mood balance.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="vitaminsNutritionalSupport" />
      </div>
    </div>
  );
}

export default VitaminsNutritionalSupport;
