import Layout from "../components/common/Layout";

import ReportCards from "../components/reports/ReportCards";
import MonthlyChart from "../components/reports/MonthlyChart";
import StatusPieChart from "../components/reports/StatusPieChart";
import ReportTable from "../components/reports/ReportTable";
import api, { getErrorMessage } from "../services/api";
import { toast } from "react-toastify";

import { Button, Form } from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { exportProductionReport } from "../utils/exportPDF";
import { useState,  useEffect } from "react";
import { exportToExcel } from "../utils/exportExcel";

import "../styles/Reports.css";

function Reports() {

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [products, setProducts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
  try {

    setLoading(true);


    const [
      productsRes,
      workOrdersRes,
      productionRes,
    ] = await Promise.all([
      api.get("/products/"),
      api.get("/workorders/"),
      api.get("/production/"),
    ]);

    setProducts(productsRes.data);
    setWorkOrders(workOrdersRes.data);
    setProductions(productionRes.data);

   } catch (error) {
    console.error(error);
    toast.error(getErrorMessage(error, "Failed to load reports"));
  } finally {
    setLoading(false);
  }
};

// 👇 Put the reports array HERE
 const reports = productions.map((item) => {

  const product = products.find(
    (p) => p.id === item.product_id
  );


  return {
    // One row per production record (the old id was built from the product id,
    // so two records of the same product shared an id).
    id: `PR${String(item.id).padStart(3, "0")}`,

    product: item.product_name ?? product?.product_name ?? "Unknown",

    production_line:
      item.production_line,

    production_date:
      item.production_date,

    target:
      item.target_quantity,

    produced:
      item.produced_quantity,

    efficiency:
      item.target_quantity > 0
        ? `${Math.round(
            (item.produced_quantity /
            item.target_quantity) * 100
          )}%`
        : "0%",

    status:
      item.status,
  };

});


const filteredReports = reports.filter((report) => {
  const matchesSearch = (report.product || "")
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    report.status === statusFilter;

  return matchesSearch && matchesStatus;
});



  const completedReports = filteredReports.filter(
    (report) => report.status === "Completed"
    ).length;

  const runningReports = filteredReports.filter(
  (report) => report.status === "Running"
  ).length;

  const delayedReports = filteredReports.filter(
  (report) => report.status === "Delayed"
  ).length;


  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">Reports</h2>
          <p className="text-muted">
            Production analytics and reporting dashboard.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="danger"
            onClick={() =>
              filteredReports.length
                ? exportProductionReport(filteredReports)
                : toast.info("No data to export")
            }
          >
            <FaFilePdf className="me-2" />
              PDF
          </Button>

           <Button
             variant="success"
             onClick={() =>
               filteredReports.length
                 ? exportToExcel(filteredReports)
                 : toast.info("No data to export")
             }
           >
             <FaFileExcel className="me-2" />
               Excel
            </Button>
        </div>

      </div>

      {loading && <p className="text-muted">Loading reports...</p>}

      <ReportCards 
      products={products}
      workOrders={workOrders}
      productions={productions} />

      <div className="d-flex gap-3 mb-4">

  <Form.Control
    style={{ maxWidth: "350px" }}
    placeholder="Search Product..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <Form.Select
    style={{ width: "200px" }}
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="All">All Status</option>
    <option value="Pending">Pending</option>
    <option value="Completed">Completed</option>
    <option value="Running">Running</option>
    <option value="Delayed">Delayed</option>
  </Form.Select>

</div>

<div className="d-flex gap-4 mb-4">

  <span className="text-muted">
    Showing <strong>{filteredReports.length}</strong> Reports
  </span>

  <span className="text-success">
    Completed: <strong>{completedReports}</strong>
  </span>

  <span className="text-primary">
    Running: <strong>{runningReports}</strong>
  </span>

  <span className="text-danger">
    Delayed: <strong>{delayedReports}</strong>
  </span>

</div>

      <MonthlyChart reports={filteredReports}/>

      <div className="row mt-4">

        <div className="col-lg-5">
          <StatusPieChart reports={filteredReports}/>
        </div>

        <div className="col-lg-7">
          <ReportTable reports={filteredReports} />
        </div>

      </div>

    </Layout>
  );
}

export default Reports;