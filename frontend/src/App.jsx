import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Pendahuluan from "./pages/Pendahuluan";
import Materi from "./pages/Materi";
import Simulasi from "./pages/Simulasi";
import Evaluasi from "./pages/Evaluasi";
import Hasil from "./pages/Hasil";
import Info from "./pages/Info";
import AdminPanel from "./pages/admin/AdminPanel";
import Navbar from "./components/Navbar";
import ParticleBackground from "./components/ParticleBackground";
import { AnimatePresence, motion } from "framer-motion";

const PAGES = ["home","pendahuluan","materi","simulasi","evaluasi","hasil","info","admin"];

export default function App() {
  const [page,         setPage]         = useState("home");
  const [darkMode,     setDarkMode]     = useState(true);
  const [quizResults,  setQuizResults]  = useState(null);
  const [progress,     setProgress]     = useState({
    pendahuluan: false,
    materi:      false,
    simulasi:    false,
    evaluasi:    false,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const navigate     = (target) => { if (PAGES.includes(target)) setPage(target); };
  const markProgress = (key)    => setProgress(prev => ({ ...prev, [key]: true }));

  // Props yang dikirim ke semua halaman
  const pageProps = {
    navigate,
    markProgress,
    progress,
    darkMode,
    quizResults,
    setQuizResults,  // ← wajib ada agar Evaluasi bisa set hasil
  };

  const renderPage = () => {
    switch (page) {
      case "home":        return <Home {...pageProps} />;
      case "pendahuluan": return <Pendahuluan {...pageProps} />;
      case "materi":      return <Materi {...pageProps} />;
      case "simulasi":    return <Simulasi {...pageProps} />;
      case "evaluasi":    return <Evaluasi {...pageProps} />;
      case "hasil":       return <Hasil {...pageProps} />;
      case "info":        return <Info {...pageProps} />;
      case "admin":       return <AdminPanel navigate={navigate} />;
      default:            return <Home {...pageProps} />;
    }
  };

  // Admin punya layout sendiri — tanpa navbar & particle
  if (page === "admin") {
    return (
      <div className={darkMode ? "dark" : "light"}>
        <AdminPanel navigate={navigate} />
      </div>
    );
  }

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <ParticleBackground />
      <Navbar
        page={page}
        navigate={navigate}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        progress={progress}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={page}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="main-content"
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
