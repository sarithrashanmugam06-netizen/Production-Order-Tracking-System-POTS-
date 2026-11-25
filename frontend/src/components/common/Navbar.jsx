import { FiBell, FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "../../styles/Navbar.css";

function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar-custom">

      <div className="navbar-left">
        <h5>Production Order Tracking System</h5>
      </div>

      <div className="navbar-right">

        <button className="icon-btn">
          <FiBell size={20} />
        </button>

        <div className="user-info">
          <FaUserCircle size={35} />

          <div>
            <h6>{user?.name}</h6>
            <small>{user?.role}</small>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FiLogOut />
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;