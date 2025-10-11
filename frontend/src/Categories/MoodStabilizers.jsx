import React from "react";
import CategoryPage from "../Components/CategoryPage";

function MoodStabilizers() {
  return (
    <div className="appliances-page">
      <div className="appliances-hero">
        <h1 className="appliances-title">Mood Stabilizers</h1>
        <p className="appliances-subtitle">
          Used for bipolar disorder and mood swings.
        </p>
      </div>
      <div className="appliances-category-container">
        <CategoryPage categoryName="moodStabilizers" />
      </div>
    </div>
  );
}

export default MoodStabilizers;
