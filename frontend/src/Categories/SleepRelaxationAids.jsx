import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function SleepRelaxationAids() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Sleep & Relaxation Aids</h1>
        <p className="appliances-subtitle">
          For insomnia, restlessness, or sleep disturbances.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="sleepRelaxationAids" />
      </div>
    </div>
  );
}

export default SleepRelaxationAids;
