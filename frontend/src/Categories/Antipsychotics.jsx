import React from "react";
import CategoryPage from "../Components/CategoryPage";
import "../styles/Category.css";

function Antipsychotics() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Antipsychotics</h1>
        <p className="appliances-subtitle">
          Used for schizophrenia, bipolar disorder, and severe mood disorders.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="antipsychotics" />
      </div>
    </div>
  );
}

export default Antipsychotics;
