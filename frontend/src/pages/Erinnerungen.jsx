import { useEffect, useState } from "react";

export default function Erinnerungen() {
    const [items, setItems] = useState([]);
    const [newText, setNewText] = useState("");
    const [loading, setLoading] = useState(true);

    // Erinnerungen vom Backend laden
    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            setLoading(true);
            // Alle angemeldeten User finden
            const usersResponse = await fetch("http://localhost:5024/api/users");
            const users = await usersResponse.json();
            const loggedInUsers = users.filter(u => u.status === true);

            if (loggedInUsers.length === 0) {
                console.log("Kein User angemeldet");
                setItems([]);
                setLoading(false);
                return;
            }

            // Notifications für alle angemeldeten User laden
            const allNotifications = [];
            for (const user of loggedInUsers) {
                const notificationsResponse = await fetch(`http://localhost:5024/api/notifications/user/${user.id}`);
                const userNotifications = await notificationsResponse.json();
                allNotifications.push(...userNotifications.map(notification => ({
                    id: notification.id,
                    text: notification.notificationMessage,
                    done: false, // Notifications haben kein "done" Status im Backend
                    userId: notification.userId
                })));
            }

            setItems(allNotifications);
        } catch (error) {
            console.error("Fehler beim Laden der Erinnerungen:", error);
        } finally {
            setLoading(false);
        }
    }

    async function addItem() {
        if (!newText.trim()) return;

        try {
            // Alle angemeldeten User finden
            const usersResponse = await fetch("http://localhost:5024/api/users");
            const users = await usersResponse.json();
            const loggedInUsers = users.filter(u => u.status === true);

            if (loggedInUsers.length === 0) {
                console.log("Kein User angemeldet");
                return;
            }

            // Erinnerung für jeden angemeldeten User erstellen
            for (const user of loggedInUsers) {
                await fetch("http://localhost:5024/api/notifications", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notificationMessage: newText.trim(),
                        userId: user.id
                    }),
                });
            }

            setNewText("");
            // Erinnerungen neu laden
            await loadNotifications();
        } catch (error) {
            console.error("Fehler beim Erstellen der Erinnerung:", error);
        }
    }

    function toggle(id) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item
            )
        );
    }

    async function remove(id) {
        try {
            // Aus Backend löschen
            await fetch(`http://localhost:5024/api/notifications/${id}`, {
                method: "DELETE",
            });
            
            // Aus State entfernen
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (error) {
            console.error("Fehler beim Löschen der Erinnerung:", error);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
                <h1>Erinnerungen</h1>
                <p>Lädt...</p>
            </div>
        );
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
