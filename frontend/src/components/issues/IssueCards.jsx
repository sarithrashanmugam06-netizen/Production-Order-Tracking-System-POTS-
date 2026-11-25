import { Card, Col, Row } from "react-bootstrap";

function IssueCards({ issues }) {
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

  const cards = [
    {
      title: "Total Issues",
      value: totalIssues,
      color: "#111827",
    },
    {
      title: "Open",
      value: openIssues,
      color: "#DC2626",
    },
    {
      title: "In Progress",
      value: progressIssues,
      color: "#F59E0B",
    },
    {
      title: "Resolved",
      value: resolvedIssues,
      color: "#16A34A",
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col lg={3} md={6} key={card.title}>
          <Card className="issue-card">
            <Card.Body className="text-center">
              <h5 className="issue-card-title">
                {card.title}
              </h5>

              <h1
                className="issue-card-value"
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

export default IssueCards;