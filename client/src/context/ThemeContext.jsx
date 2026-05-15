import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("sp_theme") || "dark"
  );

  useEffect(() => {
    const html = document.documentElement;
    theme === "light" ? html.classList.add("light") : html.classList.remove("light");
    localStorage.setItem("sp_theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <Ctx.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </Ctx.Provider>
  );
};

export const useTheme = () => useContext(Ctx);
