import {
  Table,
  Button,
} from "react-bootstrap";

import {
  FaEdit,
  FaTrash
} from "react-icons/fa";

import {
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

function IssueTable({
  issues,
  deleteIssue,
  setSelectedIssue,
  handleShow,
  canEdit,
}) {


 const getStatusClass = (status) => {
  switch (status) {
    case "Open":
      return "status-open";

    case "In Progress":
      return "status-progress";

    case "Resolved":
      return "status-resolved";

    default:
      return "status-default";
  }
};

const getSeverityClass = (severity) => {
  switch (severity) {
    case "High":
      return "priority-high";

    case "Medium":
      return "priority-medium";

    case "Low":
      return "priority-low";

    default:
      return "priority-default";
  }
};


  return (

    <Table
      striped
      bordered
      hover
      responsive
      className="mt-4 issue-table align-middle"
    >

      <thead>

        <tr>

          <th className="text-center" style={{ width: "70px" }}>No.</th>

          <th  className="text-center">Work Order</th>

          <th  className="text-center">Issue Type</th>

          <th className="text-center">Description</th>

          <th className="text-center">Severity</th>

          <th className="text-center">Reported Date</th>

          <th className="text-center">Status</th>

          {canEdit && <th className="text-center">Actions</th>}

        </tr>

      </thead>


      <tbody>


        {
          issues.length === 0 ? (

            <tr>

              <td
                colSpan="8"
                className="text-center"
              >
                No issues found
              </td>

            </tr>

          ) : (


            issues.map((issue,index) => (

              <tr key={issue.id}>


                <td>
                  {index + 1}
                </td>


                <td>
                  {issue.workorder_id}
                </td>


                <td>
                  {issue.issue_type}
                </td>


                <td className="description-cell">
                  {issue.description}
                </td>


                <td className="text-center">

                  <span
                     className={`priority-badge ${getSeverityClass(issue.severity)}`}
                  >
                     {issue.severity}
                  </span>
                </td>


                <td>
                  {issue.reported_date}
                </td>


                <td className="text-center">
                  <span
                  className={`status-badge ${getStatusClass(issue.status)}`}
                  >
                   ● {issue.status}
                  </span>
                </td>


                {canEdit && (
                <td className="text-center">

                  <OverlayTrigger
                     placement="top"
                     overlay = {<Tooltip>Edit Issue</Tooltip>}
                  >


                  <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedIssue(issue);
                        handleShow();

                    }}
                  >

                    <FaEdit />

                  </Button>
                </OverlayTrigger>

                  <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete Issue</Tooltip>}
                  >

                  <Button
                    variant="danger"
                    className="px-3"
                    size="sm"
                    onClick={() =>
                      deleteIssue(issue.id)
                    }
                  >

                    <FaTrash />

                  </Button>

                </OverlayTrigger>


                </td>
                )}


              </tr>

            ))

          )

        }


      </tbody>


    </Table>

  );

}


export default IssueTable;