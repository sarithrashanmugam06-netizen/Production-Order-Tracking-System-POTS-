import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../services/api";
import Layout from "../components/common/Layout";
import ProductModal from "../components/products/ProductModal";
import ProductTable from "../components/products/ProductTable";
import { useProducts } from "../context/ProductContext";
import { toast } from "react-toastify";

import {
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import { FaPlus } from "react-icons/fa";

function Products() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const { products, setProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/products/"
      );

      const formattedProducts = response.data.map((item) => ({
        id: item.id,
        name: item.product_name,
        category: item.category,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
        status: item.status,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setSelectedProduct(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShow(true);
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/products/${id}`
      );

      toast.success("Product Deleted Successfully");

      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Delete Failed"));
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" ||
      product.category === category;

    const matchStatus =
      status === "All" ||
      product.status === status;

    return (
      matchSearch &&
      matchCategory &&
      matchStatus
    );
  });

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (p) => p.status === "Active"
  ).length;

  const inactiveProducts = products.filter(
    (p) => p.status === "Inactive"
  ).length;



  const totalInventoryValue = products.reduce(
    (sum, product) =>
      sum + product.price * product.quantity,
    0
  );

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <h3>Loading Products...</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>

        <Button variant="primary" onClick={handleShow}>
          <FaPlus className="me-2" />
          Add Product
        </Button>
      </div>

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
        <h6>Active Products</h6>
        <h2 className="text-success">
          {activeProducts}
        </h2>
      </Card.Body>
    </Card>
  </Col>

  <Col md={3}>
    <Card className="shadow-sm border-danger text-center">
      <Card.Body>
        <h6>Inactive Products</h6>
        <h2 className="text-danger">
          {inactiveProducts}
        </h2>
      </Card.Body>
    </Card>
  </Col>

  <Col md={3}>
    <Card className="shadow-sm border-primary text-center">
      <Card.Body>
        <h6>Total Inventory Value</h6>
        <h2 className="text-primary">
          ₹ {totalInventoryValue.toLocaleString()}
        </h2>
      </Card.Body>
    </Card>
  </Col>

</Row>

      <Row className="mb-3">

        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search Product..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </Col>

        <Col md={4}>
          <Form.Select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="All">All Categories</option>
            <option value="Plastic">Plastic</option>
            <option value="Metal">Metal</option>
            <option value="Electronics">Electronics</option>
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Col>

      </Row>

      <ProductTable
        products={filteredProducts}
        deleteProduct={deleteProduct}
        handleEdit={handleEdit}
      />

      <ProductModal
        show={show}
        handleClose={handleClose}
        selectedProduct={selectedProduct}
      />
    </Layout>
  );
}

export default Products;