import { useEffect, useMemo, useState } from "react";
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
        category: "",
    };
}

const STORAGE_KEY = "studyplanner_planer_rows";

export default function Planer() {
    const [rows, setRows] = useState([createRow()]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("default");

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
        // kleine Animation: erst Klasse "deleting", dann entfernen
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, _deleting: true } : row
            )
        );

        setTimeout(() => {
            setRows((prev) => prev.filter((row) => row.id !== id));
        }, 200);
    }

    // Kategorien-Liste aus existierenden Zeilen
    const availableCategories = useMemo(() => {
        const set = new Set(
            rows
                .map((r) => r.category?.trim())
                .filter((c) => c && c.length > 0)
        );
        return Array.from(set);
    }, [rows]);

    // Filter + Sortierung anwenden
    const visibleRows = useMemo(() => {
        let list = [...rows];

        if (search.trim()) {
            const s = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.thema.toLowerCase().includes(s) ||
                    r.notizen.toLowerCase().includes(s)
            );
        }

        if (statusFilter) {
            list = list.filter((r) => r.status === statusFilter);
        }

        if (categoryFilter) {
            list = list.filter((r) => r.category === categoryFilter);
        }

        if (sortBy === "thema") {
            list.sort((a, b) => a.thema.localeCompare(b.thema));
        } else if (sortBy === "status") {
            list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        }

        return list;
    }, [rows, search, statusFilter, categoryFilter, sortBy]);

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
                {/* Filter & Sort */}
                <div className="planner-filter-bar">
                    <input
                        className="filter-input"
                        placeholder="Suche nach Thema oder Notizen…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Alle Status</option>
                        {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Alle Kategorien</option>
                        {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="default">Sortierung: Original</option>
                        <option value="thema">Thema A–Z</option>
                        <option value="status">Status</option>
                    </select>

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
                            <div className="table-header-shadow">Thema &amp; Kategorie</div>
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
                    {visibleRows.map((row) => (
                        <tr
                            key={row.id}
                            className={`fade planner-row ${
                                row._deleting ? "row-deleting" : "row-enter"
                            }`}
                        >
                            {/* Thema + Kategorie */}
                            <td>
                                <div className="thema-cell">
                                    <input
                                        className="table-input"
                                        placeholder="Thema"
                                        value={row.thema}
                                        onChange={(e) =>
                                            updateRow(row.id, "thema", e.target.value)
                                        }
                                    />
                                    <input
                                        className="category-input"
                                        placeholder="Kategorie (optional)"
                                        value={row.category}
                                        onChange={(e) =>
                                            updateRow(row.id, "category", e.target.value)
                                        }
                                    />
                                </div>
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

                    {visibleRows.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ paddingTop: "20px", opacity: 0.6 }}>
                                Keine Einträge für diese Filter.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
