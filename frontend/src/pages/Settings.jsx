import { useCallback, useEffect, useState } from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { FaSave, FaUndo } from "react-icons/fa";
import { toast } from "react-toastify";

import api, { getErrorMessage } from "../services/api";
import Layout from "../components/common/Layout";
import "../styles/Settings.css";

// Field names match the API (snake_case). These values are only shown for a
// moment until the saved settings arrive from the backend.
const defaultSettings = {
  company_name: "",
  industry: "",
  location: "",
  company_email: "",

  admin_name: "",
  admin_email: "",
  phone: "",

  notifications: true,
  dark_mode: false,
  language: "English",
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [backendStatus, setBackendStatus] = useState("checking");

  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get("/settings/");
      setSettings(response.data);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to load settings."));
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    api
      .get("/health")
      .then(() => setBackendStatus("connected"))
      .catch(() => setBackendStatus("down"));
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
  try {
    const { id, ...payload } = settings;

    await api.put(`/settings/${id}`, payload);

    toast.success("Settings updated successfully!");
  } catch (error) {
    console.error(error);
    toast.error(getErrorMessage(error, "Failed to update settings."));
  }
};

  const handleReset = () => {
  if (window.confirm("Reset unsaved changes?")) {
    fetchSettings();
    toast.info("Changes reverted.");
  }
};

  return (
    <Layout>
      <div className="settings-page">

        <div className="mb-4">
          <h2 className="fw-bold">Settings</h2>
          <p className="text-muted">
            Manage system configuration and application preferences.
          </p>
        </div>

        <Row className="g-4">

          {/* Company Information */}

          <Col lg={6}>
            <Card className="settings-card shadow-sm h-100">
              <Card.Header>
                🏢 Company Information
              </Card.Header>

              <Card.Body>

                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    name="company_name"
                    value={settings.company_name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Control
                    name="industry"
                    value={settings.industry}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    name="location"
                    value={settings.location}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="company_email"
                    value={settings.company_email}
                    onChange={handleChange}
                  />
                </Form.Group>

              </Card.Body>
            </Card>
          </Col>

          {/* Administrator */}

          <Col lg={6}>
            <Card className="settings-card shadow-sm h-100">
              <Card.Header>
                👤 Administrator Profile
              </Card.Header>

              <Card.Body>

                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="admin_name"
                    value={settings.admin_name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="admin_email"
                    value={settings.admin_email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    value="Administrator"
                    disabled
                  />
                </Form.Group>
                

              </Card.Body>
            </Card>
          </Col>

          {/* Preferences */}

          <Col lg={6}>
            <Card className="settings-card shadow-sm h-100">
              <Card.Header>
                ⚙ Preferences
              </Card.Header>

              <Card.Body>

                <Form.Check
                  className="mb-3"
                  type="switch"
                  label="Enable Notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />

            

                <Form.Group>
                  <Form.Label>Language</Form.Label>

                  <Form.Select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                  >
                    <option>English</option>
                   
                  </Form.Select>

                </Form.Group>

              </Card.Body>
            </Card>
          </Col>

          {/* System Information */}

          <Col lg={6}>
            <Card className="settings-card shadow-sm h-100">
              <Card.Header>
                💻 System Information
              </Card.Header>

              <Card.Body>

                <div className="mb-3">
                  <strong>Application</strong>
                  <p className="text-muted mb-0">
                    Production Order Tracking System
                  </p>
                </div>

                <div className="mb-3">
                  <strong>Version</strong>
                  <p className="text-muted mb-0">
                    1.0.0
                  </p>
                </div>

                <div className="mb-3">
                  <strong>Backend</strong>
                  <p
                    className={`mb-0 ${
                      backendStatus === "connected"
                        ? "text-success"
                        : backendStatus === "down"
                        ? "text-danger"
                        : "text-muted"
                    }`}
                  >
                    ●{" "}
                    {backendStatus === "connected"
                      ? "Connected"
                      : backendStatus === "down"
                      ? "Unreachable"
                      : "Checking..."}
                  </p>
                </div>

                <div className="mb-3">
                  <strong>Database</strong>
                  <p
                    className={`mb-0 ${
                      backendStatus === "connected"
                        ? "text-success"
                        : "text-muted"
                    }`}
                  >
                    ●{" "}
                    {backendStatus === "connected"
                      ? "SQLite Connected"
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <strong>Last Updated</strong>
                  <p className="text-muted mb-0">
                    July 2026
                  </p>
                </div>

              </Card.Body>
            </Card>
          </Col>

        </Row>

        <div className="text-end mt-4">

          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={handleReset}
          >
            <FaUndo className="me-2" />
            Reset
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
          >
            <FaSave className="me-2" />
            Save Changes
          </Button>

        </div>

      </div>
    </Layout>
  );
}

export default Settings;