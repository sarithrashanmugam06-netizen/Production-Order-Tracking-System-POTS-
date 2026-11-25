import { useState } from "react";

import {
  Table,
  Button,
  ProgressBar,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

function ProductionTable({
  productions,
  deleteProduction,
  setSelectedProduction,
  handleShow,
  canEdit,
}) {

  const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "status-completed";

    case "Running":
      return "status-running";

    case "Delayed":
      return "status-delayed";

    case "Pending":
      return "status-pending";

    case "Scheduled":
      return "status-scheduled";

    default:
      return "status-default";
  }
};



const itemsPerPage = 5;

const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(productions.length / itemsPerPage);

// Never point past the last page (e.g. after a delete shrinks the list)
const safePage = Math.min(currentPage, Math.max(1, totalPages));

const indexOfFirst = (safePage - 1) * itemsPerPage;

const currentProductions = productions.slice(
  indexOfFirst,
  indexOfFirst + itemsPerPage
);

  return (
    <>
    <Table striped hover responsive bordered className="align-middle">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Line</th>
          <th>Target</th>
          <th>Produced</th>
          <th width="220">Progress</th>
          <th>Status</th>
          {canEdit && <th width="140">Action</th>}
        </tr>
      </thead>

      <tbody>
        {productions.length === 0 ? (
          <tr>
            <td colSpan="8" className="text-center">
              No Production Records
            </td>
          </tr>
        ) : (
          currentProductions.map((item) => {
            const progress =
              item.target_quantity > 0
                ? Math.min(
                    100,
                    Math.round(
                      (item.produced_quantity / item.target_quantity) * 100
                    )
                  )
                : 0;

            return (
              <tr key={item.id}>
                <td>P{String(item.id).padStart(3, "0")}</td>

                <td>
                  {item.product_name ??
                    `PRD${String(item.product_id).padStart(3, "0")}`}
                </td>

                <td>{item.production_line}</td>

                <td>{item.target_quantity}</td>

                <td>{item.produced_quantity}</td>

                <td>
  <div className="progress-wrapper">

    <ProgressBar
      now={progress}
      className={`production-progress ${
        (item.status || "").toLowerCase()
      }`}
    
    />
    
    <small className="fw-semibold">
      {progress}%
    </small>

</div>
                </td>

                <td>
                  <span
                     className={`status-badge ${getStatusClass(item.status)}`}>
                      ● {item.status}
                  </span>
                </td>

                {canEdit && (
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setSelectedProduction(item);
                      handleShow();
                    }}
                  >
                    <FaEdit />
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      deleteProduction(item.id)
                    }
                  >
                    <FaTrash />
                  </Button>
                </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </Table>

    {totalPages > 1 && (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={safePage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    )}
    </>
  );
}

export default ProductionTable;
