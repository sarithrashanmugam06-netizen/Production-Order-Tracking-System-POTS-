import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// roles: optional list of roles allowed to see the page. Anyone else is sent
// back to the dashboard. (This hides pages in the UI; it is not server-side security.)
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
