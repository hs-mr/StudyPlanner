import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
                {children}
            </main>
        </div>
    );
}
