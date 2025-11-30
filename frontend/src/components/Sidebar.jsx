import { NavLink } from "react-router-dom";
import {
    HomeIcon,
    CalendarDaysIcon,
    BellIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import "../styles/sidebar.css";

export default function Sidebar() {
    const nav = [
        { name: "Dashboard", to: "/", icon: <HomeIcon /> },
        { name: "Planer", to: "/planer", icon: <CalendarDaysIcon /> },
        { name: "Erinnerungen", to: "/erinnerungen", icon: <BellIcon /> },
        { name: "Einstellungen", to: "/einstellungen", icon: <Cog6ToothIcon /> },
        { name: "Logout", to: "/login", icon: <ArrowRightOnRectangleIcon /> },
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
