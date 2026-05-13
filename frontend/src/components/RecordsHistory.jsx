import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/App.css";

const API_URL = "http://localhost:8000";

export default function RecordsHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/records/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Delete this record?")) return;

    try {
      await fetch(`${API_URL}/api/records/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading)
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        Loading records...
      </div>
    );

  if (records.length === 0)
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <h3>No Records Yet</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Submit your first prediction to save it here
        </p>
      </div>
    );

  return (
    <div className="card">
      <h2>My Records</h2>
      <div className="records-list">
        {records.map((record) => (
          <div
            key={record.id}
            style={{
              background: "var(--bg-hover)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span className="record-date">
                {new Date(record.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  background:
                    record.risk_level === "Critical"
                      ? "var(--danger-bg)"
                      : record.risk_level === "High"
                        ? "#fff7ed"
                        : record.risk_level === "Moderate"
                          ? "#fefce8"
                          : "#f0fdf4",
                  color:
                    record.risk_level === "Critical"
                      ? "var(--danger)"
                      : record.risk_level === "High"
                        ? "#ea580c"
                        : record.risk_level === "Moderate"
                          ? "#ca8a04"
                          : "#16a34a",
                }}
              >
                {record.risk_level}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontWeight: "700",
                  color:
                    record.binary_prediction === "CKD"
                      ? "var(--danger)"
                      : "var(--accent)",
                }}
              >
                {record.binary_prediction}
              </span>
              {record.binary_probability && (
                <span style={{ color: "var(--text-muted)" }}>
                  {(record.binary_probability * 100).toFixed(1)}%
                </span>
              )}
              {record.stage_prediction > 0 && (
                <span
                  style={{
                    background: "var(--primary-bg)",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Stage {record.stage_prediction}
                </span>
              )}
            </div>
            <button
              className="record-delete"
              onClick={() => deleteRecord(record.id)}
              style={{ marginTop: "10px" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
