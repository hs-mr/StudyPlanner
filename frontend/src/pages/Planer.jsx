import { useEffect, useState } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const STATUS_OPTIONS = [
    { value: "", label: "Kein Status" },
    { value: "offen", label: "Offen" },
    { value: "fertig", label: "Fertig" },
];

function createRow() {
    return {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        thema: "",
        status: "",
        notizen: "",
    };
}

const STORAGE_KEY = "studyplanner_planer_rows";

export default function Planer() {
    const [rows, setRows] = useState([createRow()]);

    // 🔄 LocalStorage laden
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length) {
                    setRows(parsed);
                }
            }
        } catch (e) {
            console.error("Konnte Planer-Daten nicht laden", e);
        }
    }, []);

    // 💾 LocalStorage speichern
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
        } catch (e) {
            console.error("Konnte Planer-Daten nicht speichern", e);
        }
    }, [rows]);

    function addRow() {
        setRows((prev) => [...prev, createRow()]);
    }

    function updateRow(id, field, value) {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    }

    function deleteRow(id) {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, _deleting: true } : row
            )
        );

        setTimeout(() => {
            setRows((prev) => prev.filter((row) => row.id !== id));
        }, 200);
    }

    function statusClass(status) {
        if (status === "offen") return "status-pill status-offen";
        if (status === "fertig") return "status-pill status-fertig";
        return "status-pill status-empty";
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>Planer</h1>

            <div
                className="card"
                style={{
                    marginTop: "30px",
                    maxWidth: "1200px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "30px",
                }}
            >
                {/* Button */}
                <div style={{ marginBottom: "20px" }}>
                    <button className="btn-primary" onClick={addRow}>
                        <PlusIcon style={{ width: "18px" }} />
                        Neue Zeile
                    </button>
                </div>

                {/* Tabelle */}
                <table className="modern-table planner-table">
                    <thead>
                    <tr>
                        <th>
                            <div className="table-header-shadow">Thema</div>
                        </th>
                        <th>
                            <div className="table-header-shadow">Status</div>
                        </th>
                        <th>
                            <div className="table-header-shadow">Notizen</div>
                        </th>
                        <th>
                            <div className="table-header-shadow"></div>
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className={`fade planner-row ${
                                row._deleting ? "row-deleting" : "row-enter"
                            }`}
                        >
                            {/* Thema */}
                            <td>
                                <input
                                    className="table-input"
                                    placeholder="Thema"
                                    value={row.thema}
                                    onChange={(e) =>
                                        updateRow(row.id, "thema", e.target.value)
                                    }
                                />
                            </td>

                            {/* Status als farbige Tags + Dropdown */}
                            <td>
                                <div className={statusClass(row.status)}>
                                    <select
                                        className="status-select"
                                        value={row.status}
                                        onChange={(e) =>
                                            updateRow(row.id, "status", e.target.value)
                                        }
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>

                            {/* Expandierbare Notizen */}
                            <td>
                  <textarea
                      className="notes-textarea"
                      placeholder="Notizen …"
                      value={row.notizen}
                      rows={1}
                      onChange={(e) =>
                          updateRow(row.id, "notizen", e.target.value)
                      }
                      onInput={(e) => {
                          e.target.style.height = "24px";
                          e.target.style.height = e.target.scrollHeight + "px";
                      }}
                  />
                            </td>

                            {/* Löschen */}
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteRow(row.id)}
                                    aria-label="Zeile löschen"
                                >
                                    <TrashIcon style={{ width: "18px" }} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ paddingTop: "20px", opacity: 0.6 }}>
                                Keine Einträge vorhanden.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
