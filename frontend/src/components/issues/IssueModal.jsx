import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api, { getErrorMessage } from "../../services/api";
import { toast } from "react-toastify";


function IssueModal({
  show,
  handleClose,
  fetchIssues,
  selectedIssue,
}) {


  const initialIssue = {
    workorder_id: "",
    issue_type: "Machine Breakdown",
    description: "",
    severity: "Medium",
    reported_date: new Date().toISOString().split("T")[0],
    status: "Open",
  };


  const [issue, setIssue] = useState(initialIssue);



  useEffect(() => {

    if (selectedIssue) {

      setIssue({
        workorder_id: selectedIssue.workorder_id || "",
        issue_type: selectedIssue.issue_type || "Machine Breakdown",
        description: selectedIssue.description || "",
        severity: selectedIssue.severity || "Medium",
        reported_date:
          selectedIssue.reported_date ||
          new Date().toISOString().split("T")[0],
        status: selectedIssue.status || "Open",
      });

    } 
    else {

      setIssue(initialIssue);

    }

  }, [selectedIssue]);




  const handleChange = (e) => {

    setIssue({
      ...issue,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async () => {

  if (!issue.workorder_id) {
  toast.error("Work Order ID is required");
  return;
}

if (Number(issue.workorder_id) <= 0) {
  toast.error("Work Order ID must be greater than 0");
  return;
}

if (issue.description.trim() === "") {
  toast.error("Description is required");
  return;
}

if (issue.description.trim().length < 5) {
  toast.error("Description must be at least 5 characters");
  return;
}

  const issueData = {
    ...issue,
    workorder_id: Number(issue.workorder_id),
  };


  try {


    if (selectedIssue) {

      // UPDATE existing issue
      await api.put(
        `/issues/${selectedIssue.id}`,
        issueData
      );


      toast.success("Issue updated successfully");


    } else {


      // CREATE new issue
      await api.post(
        "/issues/",
        issueData
      );


      toast.success("Issue added successfully");

    }



    fetchIssues();

    handleClose();


  } catch (error) {


    console.error(error);

    toast.error(getErrorMessage(error, "Operation failed"));


  }

};

  return (

    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
    >


      <Modal.Header closeButton>

        <Modal.Title>
          {selectedIssue
            ? "Edit Issue"
            : "Raise New Issue"}
        </Modal.Title>

      </Modal.Header>




      <Modal.Body>


        <Form>


          <Form.Group className="mb-3">

            <Form.Label>
              Work Order ID
            </Form.Label>


            <Form.Control

              type="number"

              name="workorder_id"

              value={issue.workorder_id}

              onChange={handleChange}

              placeholder="Enter Work Order ID"

            />

          </Form.Group>





          <Form.Group className="mb-3">

            <Form.Label>
              Issue Type
            </Form.Label>


            <Form.Select

              name="issue_type"

              value={issue.issue_type}

              onChange={handleChange}

            >

              <option>
                Machine Breakdown
              </option>

              <option>
                Material Shortage
              </option>

              <option>
                Quality Issue
              </option>

              <option>
                Power Failure
              </option>

              <option>
                Maintenance
              </option>

              <option>
                Safety Issue
              </option>

              <option>
                Other
              </option>


            </Form.Select>


          </Form.Group>





          <Form.Group className="mb-3">


            <Form.Label>
              Description
            </Form.Label>


            <Form.Control

              as="textarea"

              rows={3}

              name="description"

              value={issue.description}

              onChange={handleChange}

              placeholder="Describe the issue"

            />


          </Form.Group>





          <Form.Group className="mb-3">


            <Form.Label>
              Severity
            </Form.Label>


            <Form.Select

              name="severity"

              value={issue.severity}

              onChange={handleChange}

            >

              <option>
                High
              </option>

              <option>
                Medium
              </option>

              <option>
                Low
              </option>


            </Form.Select>


          </Form.Group>





          <Form.Group className="mb-3">


            <Form.Label>
              Reported Date
            </Form.Label>


            <Form.Control

              type="date"

              name="reported_date"

              value={issue.reported_date}

              onChange={handleChange}

            />


          </Form.Group>





          <Form.Group>


            <Form.Label>
              Status
            </Form.Label>


            <Form.Select

              name="status"

              value={issue.status}

              onChange={handleChange}

            >

              <option>
                Open
              </option>

              <option>
                In Progress
              </option>

              <option>
                Resolved
              </option>


            </Form.Select>


          </Form.Group>



        </Form>


      </Modal.Body>





      <Modal.Footer>


        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>



        <Button
          variant="primary"
          onClick={handleSubmit}
        >

          {selectedIssue
            ? "Update Issue"
            : "Save Issue"}

        </Button>



      </Modal.Footer>



    </Modal>

  );

}


export default IssueModal;