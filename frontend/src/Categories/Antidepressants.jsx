import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function Antidepressants() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Antidepressants</h1>
        <p className="appliances-subtitle">
          Used for depression, anxiety, and mood disorders.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="antidepressants" />
      </div>
    </div>
  );
}

export default Antidepressants;
