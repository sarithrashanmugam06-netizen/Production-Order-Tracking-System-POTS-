import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../services/api";
import { toast } from "react-toastify";
import ProductSelect from "../common/ProductSelect";
import {
  Modal,
  Button,
  Form,
} from "react-bootstrap";

function InventoryModal({
  show,
  handleClose,
  selectedInventory,
}) {
  const emptyInventory = {
    product_id: "",
    current_stock: "",
    minimum_stock: "",
  };

  const [inventory, setInventory] =
    useState(emptyInventory);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (selectedInventory) {
      setInventory({
        id: selectedInventory.id,
        product_id:
          selectedInventory.product_id,
        current_stock:
          selectedInventory.current_stock,
        minimum_stock:
          selectedInventory.minimum_stock,
      });
    } else {
      setInventory(emptyInventory);
    }
  }, [selectedInventory, show]);

  const handleChange = (e) => {
    setInventory({
      ...inventory,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      !inventory.product_id ||
      inventory.current_stock === "" ||
      inventory.minimum_stock === ""
    ) {
      toast.warning("Please fill all fields.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        product_id: Number(
          inventory.product_id
        ),
        current_stock: Number(
          inventory.current_stock
        ),
        minimum_stock: Number(
          inventory.minimum_stock
        ),
      };

      if (selectedInventory) {
        await api.put(
          `/inventory/${selectedInventory.id}`,
          payload
        );

        toast.success("Inventory Updated Successfully");
      } else {
        await api.post(
          "/inventory/",
          payload
        );

        toast.success("Inventory Added Successfully");
      }

      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Operation Failed"));
    } finally {
      setSaving(false);
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
          {selectedInventory
            ? "Edit Inventory"
            : "Add Inventory"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            Product
          </Form.Label>

          <ProductSelect
            value={inventory.product_id}
            onChange={handleChange}
            enabled={show}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Current Stock
          </Form.Label>

          <Form.Control
            type="number"
            name="current_stock"
            value={
              inventory.current_stock
            }
            onChange={handleChange}
            placeholder="Current Stock"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Minimum Stock
          </Form.Label>

          <Form.Control
            type="number"
            name="minimum_stock"
            value={
              inventory.minimum_stock
            }
            onChange={handleChange}
            placeholder="Minimum Stock"
          />
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
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : selectedInventory
            ? "Update Inventory"
            : "Save Inventory"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InventoryModal;