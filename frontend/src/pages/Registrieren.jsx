import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Registrieren() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validierung
        if (!username.trim() || !password.trim()) {
            setError("Bitte fülle alle Felder aus");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5024/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: username,
                    password: password,
                    status: false
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registrierung fehlgeschlagen");
            }

            const data = await response.json();
            console.log("User erfolgreich erstellt:", data);
            
            // Nach erfolgreicher Registrierung zum Login weiterleiten
            navigate("/login");
        } catch (err) {
            console.error("Fehler bei der Registrierung:", err);
            setError(err.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 100px)",
            padding: "40px"
        }}>
            <div className="card" style={{
                maxWidth: "420px",
                width: "100%",
                padding: "40px"
            }}>
                <h1 style={{
                    textAlign: "center",
                    marginBottom: "10px",
                    fontSize: "28px"
                }}>Konto erstellen</h1>
                <p style={{
                    textAlign: "center",
                    opacity: "0.6",
                    marginBottom: "30px",
                    fontSize: "15px"
                }}>Erstelle ein neues Konto für deinen Study Planner</p>

                {error && (
                    <div style={{
                        padding: "12px 16px",
                        background: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        color: "#c33",
                        fontSize: "14px",
                        marginBottom: "20px"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>Benutzername</label>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#f4f4f7",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            border: "1px solid rgba(0,0,0,0.08)"
                        }}>
                            <UserIcon style={{ width: "20px", opacity: "0.5", marginRight: "10px" }} />
                            <input
                                type="text"
                                placeholder="Wähle einen Benutzernamen"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontSize: "15px",
                                    width: "100%"
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>Passwort</label>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#f4f4f7",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            border: "1px solid rgba(0,0,0,0.08)"
                        }}>
                            <LockClosedIcon style={{ width: "20px", opacity: "0.5", marginRight: "10px" }} />
                            <input
                                type="password"
                                placeholder="Wähle ein sicheres Passwort"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontSize: "15px",
                                    width: "100%"
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: "100%",
                            padding: "14px",
                            marginTop: "10px",
                            fontSize: "16px",
                            justifyContent: "center",
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Wird erstellt..." : "Konto erstellen"}
                    </button>
                </form>

                <div style={{
                    textAlign: "center",
                    marginTop: "25px",
                    paddingTop: "25px",
                    borderTop: "1px solid rgba(0,0,0,0.08)"
                }}>
                    <span style={{ opacity: "0.6", fontSize: "14px" }}>Bereits ein Konto? </span>
                    <Link
                        to="/login"
                        style={{
                            color: "#007aff",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "14px"
                        }}
                    >
                        Jetzt anmelden
                    </Link>
                </div>
            </div>
        </div>
    );
}
