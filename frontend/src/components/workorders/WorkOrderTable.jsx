import {
  Table,
  Button,
  Pagination
} from "react-bootstrap";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";


function WorkOrderTable({
  workOrders,
  deleteWorkOrder,
  setSelectedWorkOrder,
  handleShow,
}) {


  const getPriorityClass = (priority) => {
  switch (priority) {
    case "High":
      return "priority-high";

    case "Medium":
      return "priority-medium";

    case "Low":
      return "priority-low";

    default:
      return "priority-default";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "status-completed";

    case "Running":
      return "status-running";

    case "In Progress":
      return "status-running";

    case "Delayed":
      return "status-delayed";

    case "Scheduled":
      return "status-scheduled";

    default:
      return "status-default";
  }
};

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;


  // Never point past the last page (e.g. after a search or delete shrinks the list)
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(workOrders.length / itemsPerPage)));

  const indexOfLast = safePage * itemsPerPage;

  const indexOfFirst = indexOfLast - itemsPerPage;


  const currentOrders = workOrders.slice(
    indexOfFirst,
    indexOfLast
  );


  const totalPages = Math.ceil(
    workOrders.length / itemsPerPage
  );



  return (

    <>

      <Table striped bordered hover responsive>

        <thead className="table-dark">

          <tr>
            <th>ID</th>
            <th>Order No</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Production Line</th>
            <th>Start Date</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th width="160">Action</th>
          </tr>

        </thead>


        <tbody>


          {
            workOrders.length === 0 ? (

              <tr>

                <td colSpan="10" className="text-center">

                  No Work Orders Found

                </td>

              </tr>


            ) : (


              currentOrders.map((workOrder)=>(


                <tr key={workOrder.id}>


                  <td>
                    {workOrder.id}
                  </td>


                  <td>
                    {workOrder.order_number}
                  </td>


                  <td>
                    {workOrder.product_name ?? `#${workOrder.product_id}`}
                  </td>


                  <td>
                    {workOrder.quantity}
                  </td>


                  <td>
                    {workOrder.production_line}
                  </td>


                  <td>
                    {workOrder.start_date}
                  </td>


                  <td>
                    {workOrder.due_date}
                  </td>



                  <td>

                    <span className={`priority-badge ${getPriorityClass(workOrder.priority)}`}>
                      {workOrder.priority}
                    </span>

                  </td>



                  <td>

                    <span className={`status-badge ${getStatusClass(workOrder.status)}`}>
                      ● {workOrder.status}
                    </span>

                  </td>



                  <td>


                    <Button

                      variant="warning"

                      size="sm"

                      className="me-2"

                      onClick={() => {

                        setSelectedWorkOrder(workOrder);

                        handleShow();

                      }}

                    >

                      <FaEdit />

                    </Button>



                    <Button

                      variant="danger"

                      size="sm"

                      onClick={() => deleteWorkOrder(workOrder.id)}

                    >

                      <FaTrash />

                    </Button>


                  </td>


                </tr>


              ))

            )

          }


        </tbody>


      </Table>




      {
        totalPages > 1 && (


          <div className="d-flex justify-content-center mt-3">


            <Pagination>


              {
                [...Array(totalPages)].map((_, index)=>(


                  <Pagination.Item

                    key={index}

                    active={safePage === index + 1}

                    onClick={() => setCurrentPage(index + 1)}

                  >

                    {index + 1}


                  </Pagination.Item>


                ))
              }


            </Pagination>


          </div>


        )
      }


    </>

  );

}


export default WorkOrderTable;