import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Card } from "react-bootstrap";
import { useWorkOrders } from "../../context/WorkOrderContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function ProductionChart() {
  const { workOrders } = useWorkOrders();

  const stats = {
    Running: 0,
    Pending: 0,
    Completed: 0,
    Delayed: 0,
  };

  workOrders.forEach((order) => {
    if (Object.hasOwn(stats, order.status)) {
      stats[order.status]++;
    }
  });

  const data = {
    labels: ["Running", "Pending", "Completed", "Delayed"],
    datasets: [
      {
        label: "Work Orders",
        data: [
          stats.Running,
          stats.Pending,
          stats.Completed,
          stats.Delayed,
        ],
        backgroundColor: [
          "#0EA5E9",
          "#F59E0B",
          "#22C55E",
          "#EF4444",
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Card className="dashboard-card mt-4">
      <Card.Body>
        <h5 className="mb-4 fw-bold">
          Production Status Overview
        </h5>

        <div style={{ height: "320px" }}>
          <Bar data={data} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductionChart;