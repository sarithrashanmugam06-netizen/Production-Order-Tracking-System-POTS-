import { Card, Col, Row } from "react-bootstrap";

function UserCards({ users }) {

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "Admin"
  ).length;

  const supervisorUsers = users.filter(
    (user) => user.role === "Supervisor"
  ).length;

  const plannerUsers = users.filter(
    (user) => user.role === "Planner"
  ).length;

  const departmentCount = new Set(
    users.map((user) => user.department)
  ).size;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      color: "#111827",
    },
    {
      title: "Active Users",
      value: activeUsers,
      color: "#16A34A",
    },
    {
      title: "Inactive Users",
      value: inactiveUsers,
      color: "#DC2626",
    },
    {
      title: "Admins",
      value: adminUsers,
      color: "#2563EB",
    },
    {
      title: "Supervisors",
      value: supervisorUsers,
      color: "#F59E0B",
    },
    {
      title: "Planners",
      value: plannerUsers,
      color: "#8B5CF6",
    },
    {
      title: "Departments",
      value: departmentCount,
      color: "#0EA5E9",
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col
          xl={3}
          lg={4}
          md={6}
          sm={6}
          xs={12}
          key={card.title}
        >
          <Card className="user-card">
            <Card.Body className="text-center">
              <h5 className="user-card-title">
                {card.title}
              </h5>

              <h1
                className="user-card-value"
                style={{ color: card.color }}
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

export default UserCards;