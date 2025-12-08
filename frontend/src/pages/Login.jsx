import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Login() {
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
            // Login-Request an Backend
            const response = await fetch("http://localhost:5024/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: username,
                    password: password
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Benutzername oder Passwort falsch");
                } else {
                    throw new Error("Fehler beim Anmelden");
                }
                setLoading(false);
                return;
            }

            const user = await response.json();
            console.log("User erfolgreich angemeldet:", user);
            
            // Nach erfolgreichem Login zum Dashboard weiterleiten
            navigate("/");
        } catch (err) {
            console.error("Fehler beim Login:", err);
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
                }}>Willkommen zurück</h1>
                <p style={{
                    textAlign: "center",
                    opacity: "0.6",
                    marginBottom: "30px",
                    fontSize: "15px"
                }}>Melde dich an, um fortzufahren</p>

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
                                placeholder="Dein Benutzername"
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
                                placeholder="Dein Passwort"
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
                        {loading ? "Wird angemeldet..." : "Anmelden"}
                    </button>
                </form>

                <div style={{
                    textAlign: "center",
                    marginTop: "25px",
                    paddingTop: "25px",
                    borderTop: "1px solid rgba(0,0,0,0.08)"
                }}>
                    <span style={{ opacity: "0.6", fontSize: "14px" }}>Noch kein Konto? </span>
                    <Link
                        to="/registrieren"
                        style={{
                            color: "#007aff",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "14px"
                        }}
                    >
                        Jetzt registrieren
                    </Link>
                </div>
            </div>
        </div>
    );
}
