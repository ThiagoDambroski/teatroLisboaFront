import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AppProvider from "./Context/AppProvider";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import ScrollToTop from "./ScrollToTop";
import HomePage from "./HomePage/HomePage";
import NavBar from "./Navbar/NavBar";
import Footer from "./Footer/Footer";
import CataloyPage from "./CatalogyPage/CatalogyPage";
import MoviePage from "./MoviePage/MoviePage";
import AboutUsPage from "./AboutUsPage/AboutUsPage";
import LoginPage from "./LoginPage/LoginPage";
import SearchPage from "./SearchPage/SearchPage";
import DashBoardUser from "./DashbordPage/DashBoardUser";
import DashBoardAdmin from "./DashbordPage/DashBoardAdmin";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavBar />
        <ScrollToTop />

        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashBoardUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={["ROLE_ADMIN"]}>
                <DashBoardAdmin />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<CataloyPage />} />
          <Route path="/movies/:movieId" element={<MoviePage />} />
          <Route path="/aboutUs" element={<AboutUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
