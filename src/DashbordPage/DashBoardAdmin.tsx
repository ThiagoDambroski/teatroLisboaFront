import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../scss/DashboardAdmin.scss";

import AdminUsersTab from "./admin/AdminUsersTab";
import AdminCategoriesTab from "./admin/AdminCategoriesTab";
import AdminVideosTab from "./admin/AdminVideosTab";
import AdminCreateAdminTab from "./admin/AdminCreateAdminTab";
import AdminAccountTab from "./admin/AdminAccountTab";
import AdminCollaboratorsTab from "./admin/AdminCollaboratorsTab"; 
import AdminPurchasesTab from "./admin/AdminPurchasesTab";

type TabKey = "users" | "videos" | "categories" | "collaborators" | "purchases" | "createAdmin" | "account";


export default function DashBoardAdmin() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab] = useState<TabKey>("users");

  const title = useMemo(() => {
    switch (tab) {
      case "users":
        return "Utilizadores";
      case "videos":
        return "Vídeos";
      case "categories":
        return "Categorias";
      case "collaborators":
        return "Colaboradores";
      case "createAdmin":
        return "Criar Admin";
      case "account":
        return "Minha conta";
      default:
        return "Admin";
    }
  }, [tab]);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const tabBtnClass = (key: TabKey) => `tabbtn ${tab === key ? "tabbtn--active" : ""}`;

  return (
    <main className="dash dash--admin" aria-label="Dashboard Admin">
      <header className="dashboard__top">
        <div>
          <h1 className="dashboard__title">Admin Dashboard</h1>
          <div className="dashboard__subtitle">{title}</div>
        </div>

        <div className="dashboard__actions">
          <button className="dbtn" type="button" onClick={() => navigate("/movies")}>
            Ir ao catálogo
          </button>
          <button className="dbtn dbtn--danger" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard__tabs" aria-label="Admin tabs">
        <button className={tabBtnClass("users")} type="button" onClick={() => setTab("users")} aria-pressed={tab === "users"}>
          Utilizadores
        </button>

        <button className={tabBtnClass("videos")} type="button" onClick={() => setTab("videos")} aria-pressed={tab === "videos"}>
          Vídeos
        </button>

        <button
          className={tabBtnClass("categories")}
          type="button"
          onClick={() => setTab("categories")}
          aria-pressed={tab === "categories"}
        >
          Categorias
        </button>

        <button
          className={tabBtnClass("collaborators")}
          type="button"
          onClick={() => setTab("collaborators")}
          aria-pressed={tab === "collaborators"}
        >
          Colaboradores
        </button>
        <button
          className={tabBtnClass("purchases")}
          type="button"
          onClick={() => setTab("purchases")}
          aria-pressed={tab === "purchases"}
        >
          Compras
        </button>


        <button
          className={tabBtnClass("createAdmin")}
          type="button"
          onClick={() => setTab("createAdmin")}
          aria-pressed={tab === "createAdmin"}
        >
          Criar Admin
        </button>

        <button className={tabBtnClass("account")} type="button" onClick={() => setTab("account")} aria-pressed={tab === "account"}>
          Minha conta
        </button>
      </nav>

      <section className="dashboard__panel" aria-label="Admin content">
        {tab === "users" ? <AdminUsersTab /> : null}
        {tab === "videos" ? <AdminVideosTab /> : null}
        {tab === "categories" ? <AdminCategoriesTab /> : null}
        {tab === "collaborators" ? <AdminCollaboratorsTab /> : null}
        {tab === "createAdmin" ? <AdminCreateAdminTab /> : null}
        {tab === "account" ? <AdminAccountTab /> : null}
        {tab === "purchases" ? <AdminPurchasesTab /> : null}

      </section>
    </main>
  );
}
