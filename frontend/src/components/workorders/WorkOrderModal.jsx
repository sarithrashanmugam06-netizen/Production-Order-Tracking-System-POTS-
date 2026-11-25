import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../services/api";
import { toast } from "react-toastify";
import ProductSelect from "../common/ProductSelect";
import {
  Modal,
  Button,
  Form,
} from "react-bootstrap";

function WorkOrderModal({
  show,
  handleClose,
  selectedWorkOrder,
  fetchWorkOrders,
}) {
  const emptyWorkOrder = {
    order_number: "",
    product_id: "",
    quantity: "",
    production_line: "",
    start_date: "",
    due_date: "",
    priority: "Medium",
    status: "Pending",
  };

  const [workOrder, setWorkOrder] =
    useState(emptyWorkOrder);

  useEffect(() => {
    if (selectedWorkOrder) {
      setWorkOrder(selectedWorkOrder);
    } else {
      setWorkOrder(emptyWorkOrder);
    }
  }, [selectedWorkOrder, show]);

  const handleChange = (e) => {
    setWorkOrder({
      ...workOrder,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!workOrder.product_id) {
      toast.warning("Please select a product");
      return;
    }

    try {
      const payload = {
        order_number: workOrder.order_number,
        product_id: Number(workOrder.product_id),
        quantity: Number(workOrder.quantity),
        production_line: workOrder.production_line,
        start_date: workOrder.start_date,
        due_date: workOrder.due_date,
        priority: workOrder.priority,
        status: workOrder.status,
      };

      if (selectedWorkOrder) {
        await api.put(
          `/workorders/${selectedWorkOrder.id}`,
          payload
        );

        toast.success("Work Order Updated Successfully");
      } else {
        await api.post(
          "/workorders/",
          payload
        );

        toast.success("Work Order Added Successfully");
      }

      await fetchWorkOrders();
      handleClose();

      
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Operation Failed"));
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedWorkOrder
            ? "Edit Work Order"
            : "Add Work Order"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <Form.Group className="mb-3">
          <Form.Label>Order Number</Form.Label>

          <Form.Control
            name="order_number"
            value={workOrder.order_number}
            onChange={handleChange}
            placeholder="WO-001"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product</Form.Label>

          <ProductSelect
            value={workOrder.product_id}
            onChange={handleChange}
            enabled={show}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>

          <Form.Control
            type="number"
            name="quantity"
            value={workOrder.quantity}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Production Line</Form.Label>

          <Form.Control
            name="production_line"
            value={workOrder.production_line}
            onChange={handleChange}
            placeholder="Line A"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>

          <Form.Control
            type="date"
            name="start_date"
            value={workOrder.start_date}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Due Date</Form.Label>

          <Form.Control
            type="date"
            name="due_date"
            value={workOrder.due_date}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Priority</Form.Label>

          <Form.Select
            name="priority"
            value={workOrder.priority}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>

          <Form.Select
            name="status"
            value={workOrder.status}
            onChange={handleChange}
          >
            <option>Pending</option>
            <option>Running</option>
            <option>Completed</option>
            <option>Delayed</option>
          </Form.Select>
        </Form.Group>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
        >
          {selectedWorkOrder
            ? "Update Work Order"
            : "Save Work Order"}
        </Button>

      </Modal.Footer>
    </Modal>
  );
}

export default WorkOrderModal;