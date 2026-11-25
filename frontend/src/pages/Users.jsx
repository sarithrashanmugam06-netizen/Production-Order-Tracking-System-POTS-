
import api, { getErrorMessage } from "../services/api";
import UserModal from "../components/users/UserModal";
import UserCards from "../components/users/UserCards";
import Layout from "../components/common/Layout";
import UserTable from "../components/users/UserTable";


import { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import "../styles/Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [show, setShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(
        "/users/"
      );

      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShow = () => {
    setSelectedUser(null);
    setShow(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShow(true);
  };

  const deleteUser = async (id) => {
  if (!window.confirm("Delete this user?")) return;

  try {
    await api.delete(
      `/users/${id}`
    );

    toast.success("User deleted successfully");

    fetchUsers();

  } catch (error) {
    console.error(error);
    toast.error(getErrorMessage(error, "Delete failed"));
  }
};

  const filteredUsers = users.filter((user) => {
  const searchText = search.toLowerCase();

  return (
    user.name?.toLowerCase().includes(searchText) ||
    user.email?.toLowerCase().includes(searchText) ||
    user.phone?.toLowerCase().includes(searchText) ||
    user.department?.toLowerCase().includes(searchText) ||
    user.role?.toLowerCase().includes(searchText) ||
    user.status?.toLowerCase().includes(searchText) ||
    String(user.id).includes(searchText)
  );
});

  const handleClose = () => {


  setShow(false);
  setSelectedUser(null);
  fetchUsers();
};

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-4">

  <div>
    <h2 className="fw-bold mb-1">Users</h2>
    <p className="text-muted mb-0">
      Manage system users and their roles.
    </p>
  </div>

  <Button onClick={handleShow}>
    <FaPlus className="me-2" />
    Add User
  </Button>

</div>

      <UserCards users={users} />

      <Form.Control
        className="mb-3"
        placeholder="Search by ID, Name, Email, Department, Role or Status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-muted mb-2">Showing {filteredUsers.length} of {users.length} users</p>

      <UserTable
        users={filteredUsers}
        deleteUser={deleteUser}
        handleEdit={handleEdit}
      />

      {/* UserModal will be added next */}
      <UserModal
        show={show}
        handleClose={handleClose}
        selectedUser={selectedUser}
        fetchUsers={fetchUsers}
      />
    </Layout>
  );
}

export default Users;