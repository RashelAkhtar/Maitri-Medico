import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function NaturalHerbalMentalWellness() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Natural & Herbal Mental Wellness</h1>
        <p className="appliances-subtitle">Natural & Herbal Mental Wellness</p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="naturalHerbalMentalWellness" />
      </div>
    </div>
  );
}

export default NaturalHerbalMentalWellness;
