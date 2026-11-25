import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "../../styles/Layout.css";

function Layout({ children }) {
  return (
    <>
      <Sidebar />

      <Navbar />

      <div className="main-content">
        {children}
      </div>
    </>
  );
}

export default Layout;