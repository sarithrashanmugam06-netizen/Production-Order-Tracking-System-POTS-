import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../services/api";
import Layout from "../components/common/Layout";
import WorkOrderModal from "../components/workorders/WorkOrderModal";
import WorkOrderTable from "../components/workorders/WorkOrderTable";

import {
  Button,
  Form,
  Row,
  Col,
  Card
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import { useWorkOrders } from "../context/WorkOrderContext";

function WorkOrders() {
  // Modal
  const [show, setShow] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Selected Work Order
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // Context (loaded from the backend as soon as the user logs in)
  const { workOrders, refreshWorkOrders } = useWorkOrders();

  useEffect(() => {
    refreshWorkOrders();
  }, [refreshWorkOrders]);

  // ============================
  // Modal
  // ============================

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setShow(false);
    setSelectedWorkOrder(null);
  };

  // ============================
  // Delete
  // ============================

  const deleteWorkOrder = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Work Order?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/workorders/${id}`
      );

      refreshWorkOrders();

      toast.success("Work Order Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Delete Failed"));
    }
  }

  // ============================
  // Search
  // ============================

  const query = search.toLowerCase();

  const filteredWorkOrders = workOrders.filter((wo) =>
    [wo.product, wo.order_number].some((value) =>
      (value || "").toLowerCase().includes(query)
    )
  );

  // ============================
  // Status
  // ============================

  const totalOrders = workOrders.length;

  const runningOrders = workOrders.filter(
    (wo) => wo.status === "Running"
  ).length;

  const completedOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  ).length;

  const delayedOrders = workOrders.filter(
    (wo) => wo.status === "Delayed"
  ).length;

  

  return (
    <Layout>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Work Orders</h2>

        <Button
          variant="primary"
          onClick={handleShow}
        >
          <FaPlus className="me-2" />
          Add Work Order
        </Button>
      </div>

      <Row className="mb-4">

  <Col md={3}>
    <Card className="shadow-sm text-center">
      <Card.Body>
        <h6>Total Orders</h6>
        <h2>{totalOrders}</h2>
      </Card.Body>
    </Card>
  </Col>


  <Col md={3}>
    <Card className="shadow-sm border-primary text-center">
      <Card.Body>
        <h6>Running</h6>
        <h2 className="text-primary">
          {runningOrders}
        </h2>
      </Card.Body>
    </Card>
  </Col>


  <Col md={3}>
    <Card className="shadow-sm border-success text-center">
      <Card.Body>
        <h6>Completed</h6>
        <h2 className="text-success">
          {completedOrders}
        </h2>
      </Card.Body>
    </Card>
  </Col>


  <Col md={3}>
    <Card className="shadow-sm border-danger text-center">
      <Card.Body>
        <h6>Delayed</h6>
        <h2 className="text-danger">
          {delayedOrders}
        </h2>
      </Card.Body>
    </Card>
  </Col>

</Row>

      <Form.Control
        className="mb-3"
        placeholder="Search by product or order number..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <WorkOrderTable
        workOrders={filteredWorkOrders}
        deleteWorkOrder={deleteWorkOrder}
        setSelectedWorkOrder={setSelectedWorkOrder}
        handleShow={handleShow}
      />

      <WorkOrderModal
        show={show}
        handleClose={handleClose}
        selectedWorkOrder={selectedWorkOrder}
        fetchWorkOrders={refreshWorkOrders}
      />
      

    </Layout>
  );
}

export default WorkOrders;