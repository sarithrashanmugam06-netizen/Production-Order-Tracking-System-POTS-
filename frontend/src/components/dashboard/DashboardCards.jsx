import { Card, Col, Row } from "react-bootstrap";
import {
  FiClipboard,
  FiClock,
  FiPlayCircle,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

import { useWorkOrders } from "../../context/WorkOrderContext";

function DashboardCards() {

 


  const { workOrders } = useWorkOrders();

  const total = workOrders.length;

  const pending = workOrders.filter(
    (w) => w.status === "Pending"
  ).length;

  const running = workOrders.filter(
    (w) => w.status === "Running"
  ).length;

  const completed = workOrders.filter(
    (w) => w.status === "Completed"
  ).length;

  const delayed = workOrders.filter(
    (w) => w.status === "Delayed"
  ).length;

  const cards = [
    {
      title: "Total Orders",
      value: total,
      icon: <FiClipboard />,
      iconClass: "dashboard-total",
    },
    {
      title: "Pending",
      value: pending,
      icon: <FiClock />,
      iconClass: "dashboard-pending",
    },
    {
      title: "Running",
      value: running,
      icon: <FiPlayCircle />,
      iconClass: "dashboard-running",
    },
    {
      title: "Completed",
      value: completed,
      icon: <FiCheckCircle />,
      iconClass: "dashboard-completed",
    },
    {
      title: "Delayed",
      value: delayed,
      icon: <FiAlertTriangle />,
      iconClass: "dashboard-delayed",
    },
  ];

  return (
    <Row xs={1} sm={2} md={2} lg={3} xl={5} className="g-4">
      {cards.map((card) => (
        <Col key={card.title}>
          <Card className="dashboard-card h-100 shadow-sm border-0">
            <Card.Body>
              <div className="dashboard-card-content">

                <div>
                  <h6 className="dashboard-card-title">
                    {card.title}
                  </h6>

                  <h2 className="dashboard-card-value">
                    {card.value}
                  </h2>
                </div>

                <div className={`card-icon ${card.iconClass}`}>
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

export default DashboardCards;