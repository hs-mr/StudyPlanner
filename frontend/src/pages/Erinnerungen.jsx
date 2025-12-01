import { useEffect, useState } from "react";

const STORAGE_KEY = "studyplanner_reminder_items";

export default function Erinnerungen() {
    const [items, setItems] = useState([]);
    const [newText, setNewText] = useState("");

    // Laden aus LocalStorage
    useEffect(() => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) setItems(JSON.parse(data));
        } catch {}
    }, []);

    // Speichern in LocalStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items]);

    function addItem() {
        if (!newText.trim()) return;
        const newItem = { text: newText.trim(), done: false, id: crypto.randomUUID() };
        setItems((prev) => [...prev, newItem]);
        setNewText("");
    }

    function toggle(id) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item
            )
        );
    }

    function remove(id) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    return (
        <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
            <h1>Erinnerungen</h1>

            <div className="card apple-card">

                {/* Input Box */}
                <div className="reminder-input-row">
                    <input
                        className="reminder-input"
                        placeholder="Neue Erinnerung…"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                    <button className="reminder-add-btn" onClick={addItem}>+</button>
                </div>

                {/* Liste */}
                <div className="reminder-list">
                    {items.length === 0 && (
                        <p className="empty-text">Noch keine Erinnerungen vorhanden.</p>
                    )}

                    {items.map((item) => (
                        <div key={item.id} className="reminder-item fade">
                            <div
                                className={`reminder-circle ${item.done ? "done" : ""}`}
                                onClick={() => toggle(item.id)}
                            ></div>

                            <span className={`reminder-text ${item.done ? "done-text" : ""}`}>
                {item.text}
              </span>

                            <button className="reminder-delete" onClick={() => remove(item.id)}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
