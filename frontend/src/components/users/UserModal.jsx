import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

function UserModal({
  show,
  handleClose,
  selectedUser,
}) {
  const emptyUser = {
    id : null,
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    status: "Active",
    password: "",
  };

  const [user, setUser] = useState(emptyUser);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (!show) {
    setUser(emptyUser);
    return;
  }

  if (selectedUser) {
    setUser({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      department: selectedUser.department,
      role: selectedUser.role,
      status: selectedUser.status,
      password: "",
    });
  } else {
    setUser(emptyUser);
  }
}, [show, selectedUser]);


  const handleChange = (e) => {
  const { name, value } = e.target;

  setUser({
    ...user,
    [name]:
      name === "name"
        ? value.replace(/^\s+/, "")
        : value,
  });
};

  const handleSubmit = async () => {
    if (!user.name.trim()) {
  toast.error("Name is required");
  return;
}

if (!user.email.trim()) {
  toast.error("Email is required");
  return;
}

if (!user.phone.trim()) {
  toast.error("Phone number is required");
  return;
}

if (!user.department) {
  toast.error("Please select a department");
  return;
}

if (!user.role) {
  toast.error("Please select a role");
  return;
}


const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(user.email)) {
  toast.error("Enter a valid email address");
  return;
}

if (!/^\d{10}$/.test(user.phone)) {
  toast.error("Phone number must contain 10 digits");
  return;
}
    

    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      status: user.status,
    };

    // Needed for a new user; when editing, leave blank to keep the current one.
    if (user.password) {
      if (user.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      payload.password = user.password;
    } else if (!selectedUser) {
      toast.error("Password is required for a new user");
      return;
    }

    try {
      setSaving(true);

      if (selectedUser) {
        await api.put(
          `/users/${selectedUser.id}`,
          payload
        );

        toast.success("User updated successfully");
      } else {
        await api.post(
          "/users/",
          payload
        );

        toast.success("User added successfully");
      }

      setUser(emptyUser);
      handleClose();

    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Operation failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-3">
          {selectedUser
            ? "Edit User"
            : "Add User"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            size="lg"
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Enter Full Name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            size="lg"
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Enter Email address"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            size="lg"
            type="text"
            name="phone"
            maxLength={10}
            value={user.phone}
            onChange={handleChange}
            placeholder="Enter Phone Number"
          />
        </Form.Group>

        <Form.Group className="mb-3">
  <Form.Label>Department</Form.Label>

  <Form.Select
    size="lg"
    name="department"
    value={user.department}
    onChange={handleChange}
  >
    <option value="">Select Department</option>
    <option value="Production">Production</option>
    <option value="Quality">Quality</option>
    <option value="Maintenance">Maintenance</option>
    <option value="Planning">Planning</option>
    <option value="Inventory">Inventory</option>
    <option value="Management">Management</option>
  </Form.Select>
</Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            size="lg"
            name="role"
            value={user.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Planner">Planner</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Management">Management</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {selectedUser ? "New password" : "Password"}
          </Form.Label>
          <Form.Control
            size="lg"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={
              selectedUser
                ? "Leave blank to keep the current password"
                : "At least 8 characters"
            }
            value={user.password}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            size="lg"
            name="status"
            value={user.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Form.Group>

      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          size="lg"
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : selectedUser
            ? "Update User"
            : "Save User"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserModal;