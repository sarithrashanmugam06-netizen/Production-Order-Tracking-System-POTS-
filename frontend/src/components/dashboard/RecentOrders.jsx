import { Card, Table } from "react-bootstrap";

import { useWorkOrders } from "../../context/WorkOrderContext";

function RecentOrders() {
  const { workOrders } = useWorkOrders();

  const recentOrders = [...workOrders]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "status-completed";

    case "Running":
      return "status-running";

    case "Pending":
      return "status-pending";

    case "Delayed":
      return "status-delayed";

    default:
      return "status-default";
  }
};

  return (
    <Card className="mt-4 shadow-sm border-0 rounded-4">
      <Card.Body>

        <h4 className="fw-bold mb-4">
          Recent Work Orders
        </h4>

        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>No.</th>
              <th>Order ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Start Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No Work Orders Found
                </td>
              </tr>
            ) : (
              recentOrders.map((order, index) => {

                return (
                  <tr key={order.id}>
                    <td>{index + 1}</td>

                    <td>
                      WO{String(order.id).padStart(3, "0")}
                    </td>

                    <td>
                      {order.product_name ?? "Unknown Product"}
                    </td>

                    <td>{order.quantity}</td>

                    <td>
                      {new Date(order.start_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        <span className="status-dot"></span>
                         {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

      </Card.Body>
    </Card>
  );
}

export default RecentOrders;