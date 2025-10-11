import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

function HomePage() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empowering Your Mental Wellbeing</h1>
          <p>
            Your trusted online store for mental health medicines, supplements,
            and holistic wellness care.
          </p>
          <Link to="/products" className="shop-btn">
            Explore Products
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-banner">
        <div className="trust-item">
          <i className="fa-solid fa-certificate"></i>
          <p>Certified Pharmacies</p>
        </div>
        <div className="trust-item">
          <i className="fa-solid fa-truck-medical"></i>
          <p>Fast & Secure Delivery</p>
        </div>
        <div className="trust-item">
          <i className="fa-solid fa-user-md"></i>
          <p>Verified by Experts</p>
        </div>
        <div className="trust-item">
          <i className="fa-solid fa-lock"></i>
          <p>Private & Confidential</p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {[
            {
              name: "Antidepressants",
              img: "https://www.pulsetoday.co.uk/wp-content/uploads/2020/10/antidepressant_tablets_in_box_1200x800px.jpg",
              path: "antidepressants",
            },
            {
              name: "Anti-Anxiety",
              img: "https://i5.walmartimages.com/asr/899335a6-4168-4083-8c23-6fbbc9000269_1.54a4498ce6f01141879d87384aa57058.jpeg",
              path: "antiAnxiety",
            },
            {
              name: "Mood Stabilizers",
              img: "https://cosnation.org/wp-content/uploads/2023/02/download-93.jpeg",
              path: "moodStabilizers",
            },
            {
              name: "Antipsychotics",
              img: "https://tse2.mm.bing.net/th/id/OIP.rOsfKHY_gvmoQFPrxJxorwHaE8?pid=Api&P=0&h=180",
              path: "antipsychotics",
            },
            {
              name: "Sleep & Relaxation Aids",
              img: "https://cdn.pixabay.com/photo/2017/07/10/10/06/mattress-2489615_1280.jpg",
              path: "sleepRelaxationAids",
            },
            {
              name: "Cognitive & Focus Enhancers",
              img: "https://cdn.shopify.com/s/files/1/1719/2651/files/cognitive_enhancers_2_large.jpg?v=1529162860",
              path: "cognitiveFocusEnhancers",
            },
            {
              name: "Natural & Herbal Wellness",
              img: "https://gate-academy-eg.com/wp-content/uploads/2021/05/herbal-medicines-ss-18-scaled-1.jpg",
              path: "naturalHerbalMentalWellness",
            },
            {
              name: "Vitamins & Nutritional Support",
              img: "https://www.drjohnlapuma.com/wp-content/uploads/2018/10/Oct18_Image_Feature.jpg",
              path: "vitaminsNutritionalSupport",
            },
          ].map((cat, index) => (
            <Link to={`/products/${cat.path}`} key={index}>
              <div className="category-card">
                <img src={cat.img} alt={cat.name} />
                <h3>{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
