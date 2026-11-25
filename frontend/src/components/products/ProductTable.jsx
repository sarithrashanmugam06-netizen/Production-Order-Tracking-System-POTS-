import { useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";



function ProductTable({
  products,
  deleteProduct,
  handleEdit,
}) {

  const getStatusClass = (status) => {
  switch (status) {
    case "Active":
      return "status-active";

    case "Inactive":
      return "status-inactive";

    default:
      return "status-default";
  }
};



  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentProducts = products.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(products.length / itemsPerPage);


  return (
    <>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Price (₹)</th>
            <th>Status</th>
            <th width="160">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No Products Found
              </td>
            </tr>
          ) : (
            currentProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  PRD{String(product.id).padStart(3, "0")}
                </td>

                <td>{product.name}</td>

                <td>{product.category}</td>

                <td>{product.unit}</td>

                <td>{product.quantity}</td>

                <td>₹ {product.price.toLocaleString()}</td>

                <td>
                  <span className={`status-badge ${getStatusClass(product.status)}`}>
                     ● {product.status}
                  </span>
                </td>

                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit />
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index}
                active={currentPage === index + 1}
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

export default ProductTable;