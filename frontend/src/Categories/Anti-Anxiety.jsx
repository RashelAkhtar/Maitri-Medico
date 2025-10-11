import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function AntiAnxiety() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Anti-Anxiety (Anxiolytics)</h1>
        <p className="appliances-subtitle">
          Used for generalized anxiety disorder, panic attacks, etc.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="antiAnxiety" />
      </div>
    </div>
  );
}

export default AntiAnxiety;
