import { useState } from "react";

export default function Erinnerungen() {
    const [items, setItems] = useState([]);

    function addItem() {
        setItems([...items, { text: "", done: false }]);
    }

    function toggle(i) {
        const copy = [...items];
        copy[i].done = !copy[i].done;
        setItems(copy);
    }

    function update(i, text) {
        const copy = [...items];
        copy[i].text = text;
        setItems(copy);
    }

    return (
        <div>
            <h1>Erinnerungen</h1>

            <div className="card">
                <button onClick={addItem}>Neue Erinnerung +</button>

                <div style={{ marginTop: "20px" }}>
                    {items.map((item, i) => (
                        <div key={i} className="reminder fade">
                            <div
                                onClick={() => toggle(i)}
                                className={`circle ${item.done ? "done" : ""}`}
                            />

                            <input
                                value={item.text}
                                onChange={(e) => update(i, e.target.value)}
                                className={item.done ? "done-text" : ""}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
