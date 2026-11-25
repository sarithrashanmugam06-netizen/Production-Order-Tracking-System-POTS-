import { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../context/AuthContext";
import { canEditOperations } from "../utils/permissions";
import IssueTable from "../components/issues/IssueTable";
import IssueModal from "../components/issues/IssueModal";
import api, { getErrorMessage } from "../services/api";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import {
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import "../styles/Issues.css";

function Issues() {
  const { user } = useAuth();
  const canEdit = canEditOperations(user?.role);

  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [issues, setIssues] = useState([]);

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setShow(false);
    setSelectedIssue(null);
  };

  const deleteIssue = async (id) => {
  if (!window.confirm("Delete this issue?")) return;

  try {
    await api.delete(
      `/issues/${id}`
    );

    toast.success("Issue deleted successfully");

    await fetchIssues();

  } catch (error) {
    console.error(error);
    toast.error(getErrorMessage(error, "Failed to delete issue"));
  }
};

  const fetchIssues = async () => {
  try {
    const response = await api.get(
      "/issues/"
    );

    setIssues(response.data);

  } catch (error) {
    console.error(error);
    toast.error(getErrorMessage(error, "Failed to load issues"));
  }
};


useEffect(() => {
  fetchIssues();
}, []);

 const filteredIssues = issues.filter((issue) => {
  const searchText = search.toLowerCase();

  return (
    issue.issue_type?.toLowerCase().includes(searchText) ||
    issue.description?.toLowerCase().includes(searchText) ||
    issue.status?.toLowerCase().includes(searchText) ||
    String(issue.workorder_id).includes(search)
  );
});
 
const totalIssues = issues.length;

const openIssues = issues.filter(
  (issue) => issue.status === "Open"
).length;

const progressIssues = issues.filter(
  (issue) => issue.status === "In Progress"
).length;

const resolvedIssues = issues.filter(
  (issue) => issue.status === "Resolved"
).length;


  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">Issues Management</h2>
          <p className="text-muted">
            Track and manage production issues.
          </p>
        </div>

        {canEdit && (
          <Button onClick={handleShow}>
            <FaPlus className="me-2" />
            Raise Issue
          </Button>
        )}

      </div>

      <Row className="mb-4">

  <Col md={3}>
    <Card className="shadow-sm text-center">
      <Card.Body>
        <h6>Total Issues</h6>
        <h2>{totalIssues}</h2>
      </Card.Body>
    </Card>
  </Col>

  <Col md={3}>
    <Card className="shadow-sm border-danger text-center">
      <Card.Body>
        <h6>Open</h6>
        <h2 className="text-danger">
          {openIssues}
        </h2>
      </Card.Body>
    </Card>
  </Col>

  <Col md={3}>
    <Card className="shadow-sm border-warning text-center">
      <Card.Body>
        <h6>In Progress</h6>
        <h2 className="text-warning">
          {progressIssues}
        </h2>
      </Card.Body>
    </Card>
  </Col>

  <Col md={3}>
    <Card className="shadow-sm border-success text-center">
      <Card.Body>
        <h6>Resolved</h6>
        <h2 className="text-success">
          {resolvedIssues}
        </h2>
      </Card.Body>
    </Card>
  </Col>

</Row>

<Form.Control
  className="mb-4"
  placeholder="Search by Work Order, Issue Type, Description or Status..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
/>

      

      <IssueTable
        canEdit={canEdit}
        issues={filteredIssues}
        deleteIssue={deleteIssue}
        setSelectedIssue={setSelectedIssue}
        handleShow={handleShow}
      />

      <IssueModal
        show={show}
        handleClose={handleClose}
        fetchIssues={fetchIssues}
        selectedIssue={selectedIssue}
      />
    </Layout>
  );
}

export default Issues;