import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Card } from "react-bootstrap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function MonthlyChart({ reports }) {

  // Group by year + month ("2026-07") so different years are not merged,
  // then sort chronologically. The date string is split instead of parsed with
  // new Date() to avoid timezone shifts around month boundaries.
  const totals = {};

  reports.forEach((item) => {
    const [year, month] = String(item.production_date || "").split("-");

    if (!year || !month || isNaN(Number(year)) || isNaN(Number(month))) return;

    const key = `${year}-${month.padStart(2, "0")}`;
    totals[key] = (totals[key] || 0) + Number(item.produced || 0);
  });

  const monthlyData = {};

  Object.keys(totals)
    .sort()
    .forEach((key) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString(
        "default",
        { month: "short", year: "numeric" }
      );
      monthlyData[label] = totals[key];
    });

  const data = {

    labels: Object.keys(monthlyData),

    datasets: [
      {
        label: "Production Quantity",

        data: Object.values(monthlyData),

        backgroundColor: "#2563EB",

        borderRadius: 8,
      },
    ],
  };



  const options = {

    responsive: true,

    maintainAspectRatio: false,


    plugins: {

      legend: {
        display: true,
      },


      title: {

        display: true,

        text: "Monthly Production Overview",

        font: {
          size: 18,
        },

      },

    },


    scales: {

      y: {

        beginAtZero: true,

      },

    },

  };



  return (

    <Card className="report-card mt-4">

      <Card.Body>

        <div style={{ height: "350px" }}>

          {Object.keys(monthlyData).length === 0 ? (

            <div className="text-center py-5 text-muted">

              No production data available.

            </div>

          ) : (

            <Bar
              data={data}
              options={options}
            />

          )}

        </div>

      </Card.Body>

    </Card>

  );

}


export default MonthlyChart;