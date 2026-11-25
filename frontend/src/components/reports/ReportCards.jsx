import { Card, Col, Row } from "react-bootstrap";
import {
  FaBoxOpen,
  FaClipboardList,
  FaIndustry,
  FaClock,
} from "react-icons/fa";

import "../../styles/Reports.css";

function ReportCards({
  products = [],
  workOrders = [],
  productions = [],
}) {

   // 👇 Put the calculations here
// Total Products
const totalProducts = products.length;

// Total Work Orders
const totalOrders = workOrders.length;

// Total Produced Quantity
const totalProduced = productions.reduce(
  (sum, production) => sum + production.produced_quantity,
  0
);

// Total Delayed Productions
const delayedOrders = productions.filter(
  (production) => production.status === "Delayed"
).length;

   const cards = [
  {
    title: "Products",
    value: totalProducts,
    className: "report-products",
    icon: <FaBoxOpen />,
  },
  {
    title: "Work Orders",
    value: totalOrders,
    className: "report-workorders",
    icon: <FaClipboardList />,
  },
  {
    title: "Produced",
    value: totalProduced,
    className: "report-produced",
    icon: <FaIndustry />,
  },
  {
    title: "Delayed",
    value: delayedOrders,
    className: "report-delayed",
    icon: <FaClock />,
  },
];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col lg={3} md={6} key={card.title}>
          <Card className="report-card h-100">
            <Card.Body>
              <div className="report-card-content">
                <div>
                  <h6>{card.title}</h6>
                  <h2>{card.value}</h2>
                </div>
                  <div className={`report-card-icon ${card.className}`}>
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

export default ReportCards;