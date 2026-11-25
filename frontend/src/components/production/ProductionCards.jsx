import { Card, Col, Row } from "react-bootstrap";

function ProductionCards({ productions }) {
  const totalTarget = productions.reduce(
    (sum, item) => sum + Number(item.target_quantity || 0),
    0
  );

  const totalProduced = productions.reduce(
    (sum, item) => sum + Number(item.produced_quantity || 0),
    0
  );

  const runningOrders = productions.filter(
    (item) => item.status === "Running"
  ).length;

  const efficiency =
    totalTarget > 0
      ? ((totalProduced / totalTarget) * 100).toFixed(1)
      : 0;

  const cards = [
    {
      title: "Total Target",
      value: totalTarget,
      color: "#111827",
    },
    {
      title: "Total Produced",
      value: totalProduced,
      color: "#2563EB",
    },
    {
      title: "Running Orders",
      value: runningOrders,
      color: "#16A34A",
    },
    {
      title: "Efficiency",
      value: `${efficiency}%`,
      color: "#DC2626",
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col lg={3} md={6} key={card.title}>
          <Card className="production-card">
            <Card.Body className="text-center">
              <h5>{card.title}</h5>

              <h1
                style={{
                  color: card.color,
                  fontWeight: "700",
                }}
              >
                {card.value}
              </h1>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default ProductionCards;