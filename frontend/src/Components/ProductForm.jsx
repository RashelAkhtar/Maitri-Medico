import React, { useEffect, useState } from "react";
import "../styles/ProductForm.css";

const CATEGORIES = [
  { value: "antiAnxiety", label: "Anti Anxiety" },
  { value: "antidepressants", label: "Antidepressants" },
  { value: "moodStabilizers", label: "Mood Stabilizers" },
  { value: "antipsychotics", label: "Antipsychotics" },
  { value: "sleepRelaxationAids", label: "Sleep & Relaxation Aids" },
  { value: "cognitiveFocusEnhancers", label: "Cognitive / Focus Enhancers" },
  { value: "naturalHerbalMentalWellness", label: "Natural / Herbal Mental Wellness" },
  { value: "vitaminsNutritionalSupport", label: "Vitamins & Nutritional Support" },
];

export default function ProductForm({ initial = {}, submitLabel = "Save", onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setForm({
      name: initial.name || "",
      price: initial.price != null ? String(initial.price) : "",
      category: initial.category || "",
    });
    setPreview(initial.image || null);
    setFile(null);
  }, [initial]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(initial.image || null);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    onSubmit({ ...form }, file);
  };

  return (
    <form onSubmit={submit} className="product-form" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />

        {/* Category dropdown */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          style={{ padding: "6px" }}
        >
          <option value="" disabled>
            Select category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input type="file" accept="image/*" onChange={handleFile} />
        <button type="submit">{submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
      {preview && <div style={{ marginTop: 8 }}><img src={preview} alt="preview" style={{ maxWidth: 120 }} /></div>}
    </form>
  );
}