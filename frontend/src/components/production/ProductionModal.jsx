import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import ProductSelect from "../common/ProductSelect";

function ProductionModal({
  show,
  handleClose,
  selectedProduction,
  fetchProductions,
}) {
  const emptyProduction = {
    product_id: "",
    production_line: "",
    target_quantity: "",
    produced_quantity: "",
    production_date: new Date().toLocaleDateString("en-CA"), // today, YYYY-MM-DD
    status: "Pending",
  };

  const [production, setProduction] = useState(emptyProduction);

  useEffect(() => {
    if (selectedProduction) {
      setProduction(selectedProduction);
    } else {
      setProduction(emptyProduction);
    }
  }, [selectedProduction, show]);

  const handleChange = (e) => {
    setProduction({
      ...production,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!production.product_id) {
      toast.warning("Please select a product");
      return;
    }

    if (!production.production_line) {
      toast.warning("Please select a production line");
      return;
    }

    try {
      const payload = {
        product_id: Number(production.product_id),
        production_line: production.production_line,
        target_quantity: Number(production.target_quantity),
        produced_quantity: Number(production.produced_quantity),
        production_date: production.production_date,
        status: production.status,
      };

      if (selectedProduction) {
        await api.put(
          `/production/${selectedProduction.id}`,
          payload
        );

        toast.success("Production Updated Successfully");
      } else {
        await api.post(
          "/production/",
          payload
        );

        toast.success("Production Added Successfully");
      }

      await fetchProductions();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Operation Failed"));
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedProduction ? "Edit Production" : "Add Production"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          <Form.Group className="mb-3">
            <Form.Label>Product</Form.Label>

            <ProductSelect
              value={production.product_id}
              onChange={handleChange}
              enabled={show}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Production Line</Form.Label>

            <Form.Select
              name="production_line"
              value={production.production_line}
              onChange={handleChange}
            >
              <option value="">Select Line</option>
              <option>Line A</option>
              <option>Line B</option>
              <option>Line C</option>
              <option>Line D</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Target Quantity</Form.Label>

            <Form.Control
              type="number"
              name="target_quantity"
              value={production.target_quantity}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Produced Quantity</Form.Label>

            <Form.Control
              type="number"
              name="produced_quantity"
              value={production.produced_quantity}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Production Date</Form.Label>

            <Form.Control
              type="date"
              name="production_date"
              value={production.production_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Status</Form.Label>

            <Form.Select
              name="status"
              value={production.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Running</option>
              <option>Completed</option>
              <option>Delayed</option>
            </Form.Select>
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSubmit}>
          {selectedProduction ? "Update" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductionModal;