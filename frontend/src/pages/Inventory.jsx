import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../services/api";
import { toast } from "react-toastify";

import Layout from "../components/common/Layout";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryModal from "../components/inventory/InventoryModal";

import { useInventory } from "../context/InventoryContext";

import {
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import { FaPlus } from "react-icons/fa";

function Inventory() {
  const [show, setShow] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedInventory, setSelectedInventory] =
    useState(null);

  const { inventory, setInventory } =
    useInventory();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get(
        "/inventory/"
      );

      setInventory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Summary Cards
  const totalProducts = inventory.length;

  const totalStock = inventory.reduce(
    (sum, item) => sum + item.current_stock,
    0
  );

  const lowStock = inventory.filter(
    (item) =>
      item.current_stock <= item.minimum_stock
  ).length;

  const outOfStock = inventory.filter(
  (item) => item.current_stock === 0
  ).length;

  const filteredInventory = inventory.filter(
    (item) =>
      (item.product_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(item.product_id).includes(search)
  );

  return (
    <Layout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory</h2>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedInventory(null);
            setShow(true);
          }}
        >
          <FaPlus className="me-2" />
          Add Stock
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6>Total Products</h6>
              <h2>{totalProducts}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-success text-center">
            <Card.Body>
              <h6>Total Stock</h6>
              <h2 className="text-success">
                {totalStock}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-danger text-center">
            <Card.Body>
              <h6>Low Stock</h6>
              <h2 className="text-danger">
                {lowStock}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-dark text-center">
            <Card.Body>
            <h6>Out of Stock</h6>
            <h2 className="text-dark">
               {outOfStock}
            </h2>
           </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Form.Control
        className="mb-4"
        type="text"
        placeholder="Search by product name or ID..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* Part 2 will continue here */}

      {/* Inventory Table */}
<InventoryTable
  inventory={filteredInventory}
  handleEdit={(item) => {
    setSelectedInventory(item);
    setShow(true);
  }}
  deleteInventory={async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inventory?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/inventory/${id}`
      );

      fetchInventory();

      toast.success("Inventory Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Delete Failed"));
    }
  }}
/>

{/* Inventory Modal */}
<InventoryModal
  show={show}
  handleClose={() => {
    setShow(false);
    fetchInventory();
  }}
  selectedInventory={selectedInventory}
/>

    </Layout>
  );
}

export default Inventory;