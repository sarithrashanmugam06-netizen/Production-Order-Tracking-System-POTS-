import { useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

function InventoryTable({
  inventory,
  handleEdit,
  deleteInventory,
}) {

  const getStatusClass = (item) => {
  if (item.current_stock === 0) {
    return "status-out";
  }

  if (item.current_stock <= item.minimum_stock) {
    return "status-low";
  }

  return "status-in";
};
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Never point past the last page (e.g. after a search or delete shrinks the list)
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(inventory.length / itemsPerPage)));

  const indexOfLast = safePage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentInventory = inventory.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    inventory.length / itemsPerPage
  );

  return (
    <>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Minimum Stock</th>
            <th>Status</th>
            <th width="160">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentInventory.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No Inventory Found
              </td>
            </tr>
          ) : (
            currentInventory.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.product_name ??
                    `PRD${String(item.product_id).padStart(3, "0")}`}
                </td>

                <td>{item.current_stock}</td>

                <td>{item.minimum_stock}</td>

                <td>
                  <span className={`status-badge ${getStatusClass(item)}`}>
                     ●{" "}
                    {item.current_stock === 0
                       ? "Out of Stock"
                       : item.current_stock <= item.minimum_stock
                       ? "Low Stock"
                       : "In Stock"}
                   </span>
                </td>

                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(item)}
                  >
                    <FaEdit />
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      deleteInventory(item.id)
                    }
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
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
                onClick={() =>
                  setCurrentPage(index + 1)
                }
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

export default InventoryTable;