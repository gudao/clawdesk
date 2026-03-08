import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ToastContainer } from "./components/Toast";
import { InstallPage } from "./pages/Install";
import { ServicePage } from "./pages/Service";
import { SettingsPage } from "./pages/Settings";
import { AboutPage } from "./pages/About";
import { useAppStore } from "./store";

function PageContent() {
  const currentPage = useAppStore((s) => s.currentPage);
  switch (currentPage) {
    case "install":  return <InstallPage />;
    case "service":  return <ServicePage />;
    case "settings": return <SettingsPage />;
    case "about":    return <AboutPage />;
  }
}

export default function App() {
  const darkMode = useAppStore((s) => s.darkMode);

  // Sync dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <PageContent />
      </main>
      <ToastContainer />
    </div>
  );
}
