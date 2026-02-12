import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AppProvider from "./Context/AppProvider";
import ScrollToTop from "./ScrollToTop";
import HomePage from "./HomePage/HomePage";
import NavBar from "./Navbar/NavBar";
import Footer from "./Footer/Footer";
import CataloyPage from "./CatalogyPage/CatalogyPage";
import MoviePage from "./MoviePage/MoviePage";

function App() {
  return (
    <AppProvider>
      <NavBar />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/movies" element={<CataloyPage />} />
        <Route path="/movies/:movieId" element={<MoviePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </AppProvider>
  );
}

export default App;
