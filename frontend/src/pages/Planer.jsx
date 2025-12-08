import { useEffect, useState } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const STATUS_OPTIONS = [
    { value: false, label: "Offen" },
    { value: true, label: "Fertig" },
];

function createRow() {
    return {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        planTheme: "",
        planStatus: false,
        notes: "",
        _isNew: true, // Markierung für neue Zeilen
    };
}

export default function Planer() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // Plans vom Backend laden
    useEffect(() => {
        loadPlans();
    }, []);

    async function loadPlans() {
        try {
            setLoading(true);
            // Alle angemeldeten User finden
            const usersResponse = await fetch("http://localhost:5024/api/users");
            const users = await usersResponse.json();
            const loggedInUsers = users.filter(u => u.status === true);

            if (loggedInUsers.length === 0) {
                console.log("Kein User angemeldet");
                setRows([]);
                setLoading(false);
                return;
            }

            // Plans für alle angemeldeten User laden
            const allPlans = [];
            for (const user of loggedInUsers) {
                const plansResponse = await fetch(`http://localhost:5024/api/plans/user/${user.id}`);
                const userPlans = await plansResponse.json();
                allPlans.push(...userPlans.map(plan => ({
                    ...plan,
                    id: plan.id,
                    _isNew: false
                })));
            }

            setRows(allPlans);
        } catch (error) {
            console.error("Fehler beim Laden der Pläne:", error);
        } finally {
            setLoading(false);
        }
    }

    function addRow() {
        setRows((prev) => [...prev, createRow()]);
    }

    async function updateRow(id, field, value) {
        // Lokalen State aktualisieren
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );

        // Finde die Zeile
        const row = rows.find(r => r.id === id);
        if (!row || row._isNew) return; // Neue Zeilen nicht updaten

        try {
            // Update im Backend
            await fetch(`http://localhost:5024/api/plans/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    planTheme: field === "planTheme" ? value : row.planTheme,
                    planStatus: field === "planStatus" ? value : row.planStatus,
                    notes: field === "notes" ? value : row.notes,
                    userId: row.userId
                }),
            });
        } catch (error) {
            console.error("Fehler beim Aktualisieren:", error);
        }
    }

    async function saveNewRow(row) {
        if (!row.planTheme.trim()) {
            console.log("Thema ist leer, Plan wird nicht gespeichert");
            return;
        }

        try {
            // Alle angemeldeten User finden
            const usersResponse = await fetch("http://localhost:5024/api/users");
            const users = await usersResponse.json();
            const loggedInUsers = users.filter(u => u.status === true);

            if (loggedInUsers.length === 0) {
                console.log("Kein User angemeldet");
                return;
            }

            // Plan für jeden angemeldeten User erstellen
            for (const user of loggedInUsers) {
                await fetch("http://localhost:5024/api/plans", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        planTheme: row.planTheme,
                        planStatus: row.planStatus,
                        notes: row.notes,
                        userId: user.id
                    }),
                });
            }

            // Pläne neu laden
            await loadPlans();
        } catch (error) {
            console.error("Fehler beim Erstellen des Plans:", error);
        }
    }

    function deleteRow(id) {
        const row = rows.find(r => r.id === id);
        
        if (row?._isNew) {
            // Neue Zeile einfach entfernen
            setRows((prev) => prev.filter((row) => row.id !== id));
            return;
        }

        // Animation starten
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, _deleting: true } : row
            )
        );

        setTimeout(async () => {
            try {
                // Aus Backend löschen
                await fetch(`http://localhost:5024/api/plans/${id}`, {
                    method: "DELETE",
                });
                
                // Aus State entfernen
                setRows((prev) => prev.filter((row) => row.id !== id));
            } catch (error) {
                console.error("Fehler beim Löschen:", error);
            }
        }, 200);
    }

    function statusClass(status) {
        if (status === true) return "status-pill status-fertig";
        return "status-pill status-offen";
    }

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>Planer</h1>
                <p>Lädt...</p>
            </div>
        );
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
                                    value={row.planTheme}
                                    onChange={(e) =>
                                        updateRow(row.id, "planTheme", e.target.value)
                                    }
                                    onBlur={() => {
                                        if (row._isNew && row.planTheme.trim()) {
                                            saveNewRow(row);
                                        }
                                    }}
                                />
                            </td>

                            {/* Status als farbige Tags + Dropdown */}
                            <td>
                                <div className={statusClass(row.planStatus)}>
                                    <select
                                        className="status-select"
                                        value={row.planStatus}
                                        onChange={(e) =>
                                            updateRow(row.id, "planStatus", e.target.value === "true")
                                        }
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={String(opt.value)} value={String(opt.value)}>
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
                      value={row.notes || ""}
                      rows={1}
                      onChange={(e) =>
                          updateRow(row.id, "notes", e.target.value)
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
