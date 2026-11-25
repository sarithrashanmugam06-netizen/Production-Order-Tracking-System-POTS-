import { Card, Table} from "react-bootstrap";

function ReportTable({ reports }) {
  
  const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "status-completed";

    case "Running":
      return "status-running";

    case "Delayed":
      return "status-delayed";

    default:
      return "status-default";
  }
};

  return (
    <Card className="report-table-card">
      <Card.Body className="p-3">
        <h5 className="mb-3 fw-bold">
          Production Summary
        </h5>

        <div className="report-table-wrapper">

        <Table hover className="report-table" >
          <thead className="table-dark text-center">
            <tr>
              <th>Record</th>
              <th >Product</th>
              <th>Production Line</th>
              <th style={{width: "120px"}}>Date</th>
              <th >Target</th>
              <th>Produced</th>
              <th>Efficiency</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
              
              
              {reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No reports found
                </td>
              </tr>
            ) : (
            reports.map((report) => (
              <tr key={report.id} className="text-center">
                <td>{report.id}</td>
                <td className="text-start">{report.product}</td>
                <td>{report.production_line}</td>
                <td>
                  {new Date(report.production_date)
                  .toLocaleDateString(
                    "en-GB",
                    {
                      day:"2-digit",
                      month:"short",
                      year:"numeric"
                    }
                  )
                  }
                </td>
                <td className="text-center">{report.target}</td>
                <td className="text-center">{report.produced}</td>
                <td className="text-center">{report.efficiency}</td>


                <td className="text-center">
                  <span
                  className={`status-badge ${getStatusClass(report.status)}`}
                  >
                    ● {report.status}
                  </span>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReportTable;