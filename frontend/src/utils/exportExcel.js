import * as XLSX from "xlsx";

export const exportToExcel = (reports) => {
  const rows = reports.map((report) => ({
    Record: report.id,
    Product: report.product,
    "Production Line": report.production_line,
    Date: report.production_date,
    Target: report.target,
    Produced: report.produced,
    Efficiency: report.efficiency,
    Status: report.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");

  XLSX.writeFile(workbook, "Production_Report.xlsx");
};
