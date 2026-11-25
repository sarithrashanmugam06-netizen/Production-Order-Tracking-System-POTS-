import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../services/api";
import Layout from "../components/common/Layout";
import { useAuth } from "../context/AuthContext";
import { canEditOperations } from "../utils/permissions";
import ProductionCards from "../components/production/ProductionCards";
import ProductionTable from "../components/production/ProductionTable";
import ProductionModal from "../components/production/ProductionModal";

import { Button, Form } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import "../styles/Production.css";

function Production() {
  const { user } = useAuth();
  const canEdit = canEditOperations(user?.role);

  // ==========================
  // States
  // ==========================

  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productions, setProductions] = useState([]);

  // ==========================
  // Load Data
  // ==========================

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const response = await api.get(
        "/production/"
      );

      setProductions(response.data);
    } catch (error) {
      console.error("Error fetching productions:", error);
      toast.error(getErrorMessage(error, "Failed to load productions"));
    }
  };

  // ==========================
  // Modal
  // ==========================

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setShow(false);
    setSelectedProduction(null);
  };

  // ==========================
  // Delete
  // ==========================

  const deleteProduction = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this production record?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/production/${id}`
      );

      await fetchProductions();

      toast.success("Production Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Delete Failed"));
    }
  };

  // ==========================
  // Search
  // ==========================

  const query = search.toLowerCase();

  const filteredProductions = productions.filter(
    (item) =>
      (item.product_name || "").toLowerCase().includes(query) ||
      String(item.product_id).includes(query)
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Production</h2>

          <p className="text-muted">
            Monitor and manage daily production activities.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            onClick={handleShow}
          >
            <FaPlus className="me-2" />
            Add Production
          </Button>
        )}
      </div>

      <ProductionCards productions={productions} />

      <Form.Control
        type="text"
        placeholder="Search by product name or ID..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      

      <ProductionTable
        canEdit={canEdit}
        productions={filteredProductions}
        deleteProduction={deleteProduction}
        setSelectedProduction={setSelectedProduction}
        handleShow={handleShow}
      />

      <ProductionModal
        show={show}
        handleClose={handleClose}
        selectedProduction={selectedProduction}
        fetchProductions={fetchProductions}
      />
    </Layout>
  );
}

export default Production;