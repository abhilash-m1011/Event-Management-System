import AdminNavbar from "./AdminNavbar";

function Layout({ children }) {
  return (
    <>
      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #050818;
        }

        .layout-body {
          display: flex;
          flex: 1;
        }

        .content {
          flex: 1;
          padding: 32px;
          min-width: 0;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 768px) {
          .content { padding: 20px 16px; }
        }
      `}</style>

      <div className="layout">
        <AdminNavbar />
        <div className="layout-body">
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
