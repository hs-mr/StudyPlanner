import { useState } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Planer() {
    const [rows, setRows] = useState([{ thema: "", status: "", notizen: "" }]);

    function addRow() {
        setRows([...rows, { thema: "", status: "", notizen: "" }]);
    }

    function updateRow(index, field, value) {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    }

    function deleteRow(idx) {
        const updated = rows.filter((_, i) => i !== idx);
        setRows(updated);
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
                <button className="btn-primary" onClick={addRow}>
                    <PlusIcon style={{ width: "18px" }} />
                    Neue Zeile
                </button>

                {/* Tabelle */}
                <table className="modern-table">
                    <thead>
                    <tr>
                        <th>Thema</th>
                        <th>Status</th>
                        <th>Notizen</th>
                        <th></th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="fade">
                            <td>
                                <input
                                    className="table-input"
                                    value={row.thema}
                                    onChange={(e) => updateRow(i, "thema", e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    className="table-input"
                                    value={row.status}
                                    onChange={(e) => updateRow(i, "status", e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    className="table-input"
                                    value={row.notizen}
                                    onChange={(e) => updateRow(i, "notizen", e.target.value)}
                                />
                            </td>
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteRow(i)}
                                >
                                    <TrashIcon style={{ width: "18px" }} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
