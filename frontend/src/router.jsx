import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Planer from "./pages/Planer";
import Erinnerungen from "./pages/Erinnerungen";
import Einstellungen from "./pages/Einstellungen";
import Login from "./pages/Login";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />

                <Route
                    path="/planer"
                    element={
                        <MainLayout>
                            <Planer />
                        </MainLayout>
                    }
                />

                <Route
                    path="/erinnerungen"
                    element={
                        <MainLayout>
                            <Erinnerungen />
                        </MainLayout>
                    }
                />

                <Route
                    path="/einstellungen"
                    element={
                        <MainLayout>
                            <Einstellungen />
                        </MainLayout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}
