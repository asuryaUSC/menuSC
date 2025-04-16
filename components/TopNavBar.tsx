import { Search, Utensils } from "lucide-react";
import Link from "next/link";

export function TopNavBar() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0 0 0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
        minHeight: 60,
        width: "100%",
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", paddingLeft: 16 }}>
        <Link href="/search" passHref>
          <button
            aria-label="Search"
            style={{
              padding: 10,
              borderRadius: 9999,
              background: "#f4f4f5",
              border: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "background 0.18s, box-shadow 0.18s",
              cursor: "pointer",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={e => e.currentTarget.style.background = "#e4e4e7"}
            onMouseOut={e => e.currentTarget.style.background = "#f4f4f5"}
          >
            <Search size={20} color="#222" />
          </button>
        </Link>
      </div>
      <div style={{ flex: 2, textAlign: "center", fontWeight: 700, fontSize: 22, fontFamily: "Outfit", color: "#990000", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Utensils size={22} color="#990000" style={{ marginBottom: -2 }} />
        MenuSC
      </div>
      <div style={{ flex: 1 }}></div>
    </div>
  );
} 