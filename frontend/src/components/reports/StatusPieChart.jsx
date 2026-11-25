import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";
import { Card } from "react-bootstrap";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function StatusPieChart({ reports }) {

  const completed = reports.filter(
  (report) => report.status === "Completed"
).length;

const running = reports.filter(
  (report) => report.status === "Running"
).length;

const delayed = reports.filter(
  (report) => report.status === "Delayed"
).length;

const pending = reports.filter(
  (report) => report.status === "Pending"
).length;


  const data = {
    labels: [
      "Completed",
      "Running",
      "Pending",
      "Delayed",
    ],

    datasets: [
      {
       data: [
             completed,
             running,
             pending,
             delayed,
            ],

        backgroundColor: [
          "#22C55E",
          "#2563EB",
          "#F59E0B",
          "#EF4444",
        ],

        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: "bottom",
      },

      title: {
        display: true,
        text: "Work Order Status",
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <Card className="report-card">
      <Card.Body>
        {reports.length === 0 ? (
          <div className="text-center py-5 text-muted">
              No status data available.
          </div>
  ) : (
      <Pie
        data={data}
        options={options}
      />
  )}

</Card.Body>
    </Card>
  );
}

export default StatusPieChart;