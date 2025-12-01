import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const [planerRows, setPlanerRows] = useState([]);
    const [reminders, setReminders] = useState([]);

    // Daten laden aus LocalStorage
    useEffect(() => {
        const p = localStorage.getItem("studyplanner_planer_rows");
        if (p) {
            try { setPlanerRows(JSON.parse(p)); } catch {}
        }

        const r = localStorage.getItem("studyplanner_reminder_items");
        if (r) {
            try { setReminders(JSON.parse(r)); } catch {}
        }
    }, []);

    // Planer – nur die ersten 3 Zeilen als Teaser
    const planerPreview = planerRows.slice(0, 3);

    // Erinnerungen – nur die ersten 5 Einträge
    const reminderPreview = reminders.slice(0, 5);

    return (
        <div style={{ padding: "40px" }}>
            <h1>Willkommen zurück 👋</h1>

            <div className="dashboard-grid">

                {/* PLANER CARD */}
                <div className="card dashboard-card">
                    <h2>📘 Planer – Vorschau</h2>
                    <p className="card-subtitle">Deine letzten Themen auf einen Blick.</p>

                    <div className="dashboard-list">
                        {planerPreview.length === 0 && (
                            <p className="empty-text">Noch keine Themen angelegt.</p>
                        )}

                        {planerPreview.map((row) => (
                            <div key={row.id} className="dashboard-item">
                                <div className="item-main">
                                    <strong>{row.thema || "Unbenanntes Thema"}</strong>
                                    {row.category && <span className="dash-category">{row.category}</span>}
                                </div>

                                <span className={`dash-status dash-${row.status || "empty"}`}>
                  {row.status === "" && "Kein Status"}
                                    {row.status === "offen" && "Offen"}
                                    {row.status === "in_bearbeitung" && "In Bearbeitung"}
                                    {row.status === "fertig" && "Fertig"}
                </span>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary" onClick={() => navigate("/planer")}>
                        Zum Planer →
                    </button>
                </div>

                {/* ERINNERUNGEN CARD */}
                <div className="card dashboard-card">
                    <h2>🔔 Erinnerungen – Vorschau</h2>
                    <p className="card-subtitle">Die nächsten Aufgaben.</p>

                    <div className="dashboard-list">
                        {reminderPreview.length === 0 && (
                            <p className="empty-text">Noch keine Erinnerungen vorhanden.</p>
                        )}

                        {reminderPreview.map((item, idx) => (
                            <div key={idx} className="dashboard-item">
                                <div className={`reminder-circle ${item.done ? "reminder-done" : ""}`}></div>
                                <span className={item.done ? "done-text" : ""}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary" onClick={() => navigate("/erinnerungen")}>
                        Zu den Erinnerungen →
                    </button>
                </div>

            </div>
        </div>
    );
}
