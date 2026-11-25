import { Card, Col, Row } from "react-bootstrap";
import {
  FaBuilding,
  FaUserShield,
  FaBell,
  FaDatabase,
} from "react-icons/fa";

function SettingsCards() {
  const cards = [
    {
      title: "Company",
      value: "Configured",
      color: "#2563EB",
      icon: <FaBuilding />,
    },
    {
      title: "Admin",
      value: "Active",
      color: "#22C55E",
      icon: <FaUserShield />,
    },
    {
      title: "Notifications",
      value: "Enabled",
      color: "#F59E0B",
      icon: <FaBell />,
    },
    {
      title: "Database",
      value: "SQLite",
      color: "#8B5CF6",
      icon: <FaDatabase />,
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col lg={3} md={6} key={card.title}>
          <Card className="settings-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>{card.title}</h6>
                  <h5>{card.value}</h5>
                </div>

                <div
                  className="report-icon"
                  style={{
                    background: card.color,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default SettingsCards;