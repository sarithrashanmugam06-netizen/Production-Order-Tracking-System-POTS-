import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportProductionReport(reports = []) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text("Production Report", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-GB")}`, 14, 27);

  autoTable(doc, {
    startY: 33,
    head: [
      [
        "Record",
        "Product",
        "Line",
        "Date",
        "Target",
        "Produced",
        "Efficiency",
        "Status",
      ],
    ],
    body: reports.map((report) => [
      report.id,
      report.product,
      report.production_line,
      report.production_date,
      report.target,
      report.produced,
      report.efficiency,
      report.status,
    ]),
  });

  doc.save("Production_Report.pdf");
}
