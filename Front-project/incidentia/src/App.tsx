import { Provider } from "react-redux";
import { store } from "./store/store"; 

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme/theme-provider";

import { Sidebar } from "./components/layout/sidebar";
import { Navbar } from "./components/layout/navbar";
import { TicketsDashboard } from "./components/tickets/tickets-dashboard";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import CompleteProfile from "./features/auth/pages/CompleteProfile";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="incidentia-theme">
        <Router>
          <Routes>
            {/* Public auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* Protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex flex-1 flex-col">
                    <Navbar />
                    <main className="flex-1 overflow-auto p-6">
                      <TicketsDashboard />
                    </main>
                  </div>
                </div>
              }
            />

            {/* Catch-all → redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}
