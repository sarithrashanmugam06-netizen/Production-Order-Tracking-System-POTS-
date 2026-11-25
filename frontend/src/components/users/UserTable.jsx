import { useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

function UserTable({
  users,
  deleteUser,
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentUsers = users.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(users.length / itemsPerPage);


  

  return (
    <>
      <div className="table-container">
        <Table hover responsive className="users-table">
        <thead className="table-dark">
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Role</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentUsers.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No Users Found
              </td>
            </tr>
          ) : (
            currentUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  USR{String(user.id).padStart(3, "0")}
                </td>

                <td>{user.name}</td>

                <td>{user.email}</td>

                <td>{user.phone}</td>

                <td>{user.department}</td>

                <td>{user.role}</td>

                <td className="text-center">
                  <span
                  className={`status-badge ${getStatusClass(user.status)}`}
                  >
                    ● {user.status}
                  </span>
                </td>

                <td className="text-center">
                  <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={()=> handleEdit(user)}
                  >
                   <FaEdit />
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                  <FaTrash />
                </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      </div>

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

export default UserTable;