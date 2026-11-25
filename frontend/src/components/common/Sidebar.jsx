import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiClipboard,
  FiTool,
  FiAlertCircle,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiArchive,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import "../../styles/Sidebar.css";


function Sidebar() {

  const { user } = useAuth();

  const role = user?.role;


  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="logo">
        <div className="logo-mark">P</div>

        <div>
          <h3>POTS</h3>
          <span>
            Production Order Tracking System
          </span>
        </div>
      </div>


      {/* User */}
      <div className="sidebar-user">
        <small>SIGNED IN AS</small>

        <h6>
          {user?.name}
        </h6>

        <small>
          {role}
        </small>
      </div>


      {/* Common Dashboard */}

      <p className="menu-title">
        OVERVIEW
      </p>

      <NavLink to="/dashboard">
        <FiHome />
        <span>Dashboard</span>
      </NavLink>



      {/* ADMIN + PLANNER */}

      {(role === "Admin" ||
        role === "Planner") && (

        <>
          <p className="menu-title">
            MASTER DATA
          </p>


          <NavLink to="/products">
            <FiPackage />
            <span>Products</span>
          </NavLink>


          <NavLink to="/inventory">
            <FiArchive />
            <span>Inventory</span>
          </NavLink>


          <NavLink to="/workorders">
            <FiClipboard />
            <span>Work Orders</span>
          </NavLink>

        </>
      )}




      {/* ADMIN + PLANNER + MANAGEMENT */}

      {(
         role === "Admin" ||
         role === "Planner" ||
         role === "Supervisor" ||
         role === "Management"
        ) && (

        <>
          <p className="menu-title">
            PRODUCTION
          </p>


          <NavLink to="/production">
            <FiTool />
            <span>Production</span>
          </NavLink>


          <NavLink to="/issues">
            <FiAlertCircle />
            <span>Issues</span>
          </NavLink>

        </>
      )}





      {/* REPORTS */}

      {(role === "Admin" || role === "Management") && (

  <>
    <p className="menu-title">
      REPORTS
    </p>

    <NavLink to="/reports">
      <FiBarChart2 />
      <span>Reports</span>
    </NavLink>
  </>

)}





      {/* ADMIN ONLY */}

      {role === "Admin" && (

        <>
          <p className="menu-title">
            ADMINISTRATION
          </p>


          <NavLink to="/users">
            <FiUsers />
            <span>Users</span>
          </NavLink>



          <p className="menu-title">
            SYSTEM
          </p>


          <NavLink to="/settings">
            <FiSettings />
            <span>Settings</span>
          </NavLink>

        </>
      )}


    </aside>
  );
}


export default Sidebar;