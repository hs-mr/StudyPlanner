export default function Login() {
    return (
        <div style={{ padding: "40px" }}>
            <h1>Login</h1>

            <div className="card" style={{ maxWidth: "350px" }}>
                <form>
                    <label>Benutzername</label>
                    <input type="text" />

                    <label>Passwort</label>
                    <input type="password" />

                    <button style={{ marginTop: "20px" }}>Anmelden</button>
                </form>
            </div>
        </div>
    );
}
