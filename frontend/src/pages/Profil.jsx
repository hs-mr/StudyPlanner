import { useState, useEffect } from "react";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Profil() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const response = await fetch("http://localhost:5024/api/users");
            const users = await response.json();
            const activeUser = users.find(u => u.status === true);
            
            if (!activeUser) {
                navigate("/login");
                return;
            }
            
            setUser(activeUser);
        } catch (error) {
            console.error("Fehler beim Laden des Users:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:5024/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...user,
                    status: false
                })
            });

            if (response.ok) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Fehler beim Abmelden:", error);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: "2rem" }}>
                <p>Lädt...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={{ 
            padding: "2rem",
            maxWidth: "600px",
            margin: "0 auto"
        }}>
            <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "2rem"
                }}>
                    <UserCircleIcon style={{ width: "64px", height: "64px", color: "#3b82f6" }} />
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
                        Profil
                    </h1>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#6b7280",
                            marginBottom: "0.5rem"
                        }}>
                            Benutzername
                        </label>
                        <p style={{
                            fontSize: "1.125rem",
                            fontWeight: "500",
                            color: "#111827"
                        }}>
                            {user.name}
                        </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#6b7280",
                            marginBottom: "0.5rem"
                        }}>
                            Benutzer-ID
                        </label>
                        <p style={{
                            fontSize: "1.125rem",
                            fontWeight: "500",
                            color: "#111827"
                        }}>
                            {user.id}
                        </p>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#6b7280",
                            marginBottom: "0.5rem"
                        }}>
                            Status
                        </label>
                        <p style={{
                            fontSize: "1.125rem",
                            fontWeight: "500",
                            color: user.status ? "#10b981" : "#ef4444"
                        }}>
                            {user.status ? "Angemeldet" : "Abgemeldet"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
                >
                    <ArrowRightOnRectangleIcon style={{ width: "20px", height: "20px" }} />
                    Abmelden
                </button>
            </div>
        </div>
    );
}
