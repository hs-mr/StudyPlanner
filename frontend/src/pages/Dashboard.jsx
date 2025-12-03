import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDaysIcon, BellIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            // Lade angemeldete User
            const usersResponse = await fetch("http://localhost:5024/api/users");
            const users = await usersResponse.json();
            const loggedInUsers = users.filter(u => u.status === true);
            
            if (loggedInUsers.length > 0) {
                setUserName(loggedInUsers[0].name);
                
                // Lade Plans für alle angemeldeten User
                const allPlans = [];
                for (const user of loggedInUsers) {
                    const plansResponse = await fetch(`http://localhost:5024/api/plans/user/${user.id}`);
                    const userPlans = await plansResponse.json();
                    allPlans.push(...userPlans);
                }
                setPlans(allPlans);

                // Lade Notifications für alle angemeldeten User
                const allNotifications = [];
                for (const user of loggedInUsers) {
                    const notificationsResponse = await fetch(`http://localhost:5024/api/notifications/user/${user.id}`);
                    const userNotifications = await notificationsResponse.json();
                    allNotifications.push(...userNotifications);
                }
                setNotifications(allNotifications);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Dashboard-Daten:", error);
        } finally {
            setLoading(false);
        }
    }

    const planerPreview = plans.slice(0, 5);
    const reminderPreview = notifications.slice(0, 5);

    const openPlans = plans.filter(p => !p.planStatus).length;
    const completedPlans = plans.filter(p => p.planStatus).length;

    if (loading) {
        return (
            <div style={{ padding: "2rem" }}>
                <p>Lädt...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
                    Willkommen zurück{userName ? `, ${userName}` : ""} 👋
                </h1>
                <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
                    Hier ist deine Übersicht
                </p>
            </div>

            {/* Statistik-Karten */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem"
            }}>
                <div style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{
                        backgroundColor: "#dbeafe",
                        padding: "0.75rem",
                        borderRadius: "8px"
                    }}>
                        <CalendarDaysIcon style={{ width: "32px", height: "32px", color: "#3b82f6" }} />
                    </div>
                    <div>
                        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                            Offene Pläne
                        </p>
                        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
                            {openPlans}
                        </p>
                    </div>
                </div>

                <div style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{
                        backgroundColor: "#dcfce7",
                        padding: "0.75rem",
                        borderRadius: "8px"
                    }}>
                        <CheckCircleIcon style={{ width: "32px", height: "32px", color: "#10b981" }} />
                    </div>
                    <div>
                        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                            Abgeschlossen
                        </p>
                        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
                            {completedPlans}
                        </p>
                    </div>
                </div>

                <div style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{
                        backgroundColor: "#fef3c7",
                        padding: "0.75rem",
                        borderRadius: "8px"
                    }}>
                        <BellIcon style={{ width: "32px", height: "32px", color: "#f59e0b" }} />
                    </div>
                    <div>
                        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                            Erinnerungen
                        </p>
                        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
                            {notifications.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hauptbereich mit Plans und Erinnerungen */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1.5rem"
            }}>
                {/* PLANER CARD */}
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1.5rem"
                    }}>
                        <CalendarDaysIcon style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
                            Planer
                        </h2>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        {planerPreview.length === 0 ? (
                            <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>
                                Noch keine Pläne angelegt.
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {planerPreview.map((plan) => (
                                    <div
                                        key={plan.id}
                                        style={{
                                            padding: "1rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "8px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: "500", color: "#111827", marginBottom: "0.25rem" }}>
                                                {plan.planTheme || "Unbenanntes Thema"}
                                            </p>
                                            {plan.notes && (
                                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                                    {plan.notes}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            style={{
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "9999px",
                                                fontSize: "0.75rem",
                                                fontWeight: "500",
                                                backgroundColor: plan.planStatus ? "#dcfce7" : "#fee2e2",
                                                color: plan.planStatus ? "#065f46" : "#991b1b"
                                            }}
                                        >
                                            {plan.planStatus ? "Fertig" : "Offen"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate("/planer")}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                    >
                        Zum Planer →
                    </button>
                </div>

                {/* ERINNERUNGEN CARD */}
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1.5rem"
                    }}>
                        <BellIcon style={{ width: "24px", height: "24px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
                            Erinnerungen
                        </h2>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        {reminderPreview.length === 0 ? (
                            <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>
                                Noch keine Erinnerungen vorhanden.
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {reminderPreview.map((notification) => (
                                    <div
                                        key={notification.id}
                                        style={{
                                            padding: "1rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem"
                                        }}
                                    >
                                        <ClockIcon style={{ width: "20px", height: "20px", color: "#f59e0b", flexShrink: 0 }} />
                                        <p style={{ color: "#111827", margin: 0 }}>
                                            {notification.notificationMessage}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate("/erinnerungen")}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d97706"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f59e0b"}
                    >
                        Zu den Erinnerungen →
                    </button>
                </div>
            </div>
        </div>
    );
}
