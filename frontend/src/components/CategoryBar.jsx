const categories = [
  "Perros",
  "Hamburguesas",
  "Salchipapas",
  "Bebidas",
  "Adiciones",
  "Picadas",
  "Suizos",
];

export default function CategoryBar({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            background: selected === cat ? "#2b6cb0" : "#90c2ff",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
