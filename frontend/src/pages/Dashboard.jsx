import Layout from "../components/common/Layout";

import DashboardCards from "../components/dashboard/DashboardCards";
import RecentOrders from "../components/dashboard/RecentOrders";
import ProductionChart from "../components/dashboard/ProductionChart";

import { useAuth } from "../context/AuthContext";

import "../styles/Dashboard.css";


function Dashboard() {

  const { user } = useAuth();

  const role = user?.role;


  return (
    <Layout>

      <main className="dashboard">


        <div className="dashboard-header">

          <h2>
            Dashboard
          </h2>


          <p>
            Welcome back, {user?.name} 👋
          </p>


          <small>
            Role: {role}
          </small>

        </div>



        {/* ADMIN DASHBOARD */}

        {role === "Admin" && (

          <>
            <DashboardCards />

            <RecentOrders />

            <ProductionChart />
          </>

        )}





        {/* PRODUCT PLANNER DASHBOARD */}

        {(role === "Planner" || role === "Supervisor") && (

          <>

            <DashboardCards />

            <RecentOrders />

          </>

        )}






        {/* MANAGEMENT DASHBOARD */}

        {role === "Management" && (

          <>

            <DashboardCards />

            <ProductionChart />

            <RecentOrders />

          </>

        )}



      </main>


    </Layout>
  );
}


export default Dashboard;