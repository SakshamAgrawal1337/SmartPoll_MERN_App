import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--bg-card)",
                color: "var(--tx)",
                border: "1px solid var(--border)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                borderRadius: "12px",
                boxShadow: "var(--shadow)",
              },
              success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#F43F5E", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
