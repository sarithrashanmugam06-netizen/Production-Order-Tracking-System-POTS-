import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

function ProductModal({
  show,
  handleClose,
  selectedProduct,
}) {
  const emptyProduct = {
    name: "",
    category: "",
    unit: "",
    price: "",
    quantity: 0,
    status: "Active",
  };

  const [product, setProduct] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setProduct({
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        unit: selectedProduct.unit,
        price: selectedProduct.price,
        quantity: selectedProduct.quantity,
        status: selectedProduct.status,
      });
    } else {
      setProduct(emptyProduct);
    }
  }, [selectedProduct, show]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]:
        e.target.name === "price" ||
        e.target.name === "quantity"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!product.name.trim()) {
      toast.warning("Please enter Product Name.");
      return;
    }

    if (!product.category.trim()) {
      toast.warning("Please enter Category.");
      return;
    }

    if (!product.unit.trim()) {
      toast.warning("Please enter Unit.");
      return;
    }

    if (product.price <= 0) {
      toast.warning("Price must be greater than 0.");
      return;
    }

    if (product.quantity < 0) {
      toast.warning("Quantity cannot be negative.");
      return;
    }

    const payload = {
      product_name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
    };

    try {
      setSaving(true);

      if (selectedProduct) {
        await api.put(
          `/products/${selectedProduct.id}`,
          payload
        );

        toast.success("Product Updated Successfully");
      } else {
        await api.post(
          "/products/",
          payload
        );

        toast.success("Product Added Successfully");
      }

      setProduct(emptyProduct);
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
          {selectedProduct
            ? "Edit Product"
            : "Add Product"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Enter Product Name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            placeholder="Enter Category"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Unit</Form.Label>
          <Form.Control
            type="text"
            name="unit"
            value={product.unit}
            onChange={handleChange}
            placeholder="Enter Unit (PCS, KG, LTR)"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price (₹)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Enter Price"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="Enter Quantity"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            name="status"
            value={product.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={saving}
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
            : selectedProduct
            ? "Update Product"
            : "Save Product"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductModal;