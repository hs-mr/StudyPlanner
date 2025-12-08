import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    HomeIcon,
    CalendarDaysIcon,
    BellIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserPlusIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import "../styles/sidebar.css";

export default function Sidebar() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        checkLoggedInUser();
        
        // Regelmäßig den User-Status prüfen
        const interval = setInterval(checkLoggedInUser, 1000);
        
        return () => clearInterval(interval);
    }, []);

    async function checkLoggedInUser() {
        try {
            const response = await fetch("http://localhost:5024/api/users");
            const users = await response.json();
            const activeUser = users.find(u => u.status === true);
            setLoggedInUser(activeUser || null);
        } catch (error) {
            console.error("Fehler beim Laden des Users:", error);
        }
    }

    const nav = [
        { name: "Dashboard", to: "/", icon: <HomeIcon /> },
        { name: "Planer", to: "/planer", icon: <CalendarDaysIcon /> },
        { name: "Erinnerungen", to: "/erinnerungen", icon: <BellIcon /> },
        { name: "Einstellungen", to: "/einstellungen", icon: <Cog6ToothIcon /> },
        // Dynamisch: Entweder Profil oder Registrieren/Anmelden
        ...(loggedInUser 
            ? [{ name: "Profil", to: "/profil", icon: <UserCircleIcon /> }]
            : [
                { name: "Registrieren", to: "/registrieren", icon: <UserPlusIcon /> },
                { name: "Anmelden", to: "/login", icon: <ArrowRightOnRectangleIcon /> },
              ]
        ),
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">Study Planner</div>

            <nav className="sidebar-nav">
                {nav.map((item) => (
                    <NavLink key={item.name} to={item.to} className="sidebar-link">
                        <div className="link-icon">{item.icon}</div>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
