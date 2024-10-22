import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "",
    dueDate: "",
    status: "",
  });
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [taskPriorityData, setTaskPriorityData] = useState({
    labels: [],
    datasets: [
      {
        label: "Number of Tasks",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [taskStatusData, setTaskStatusData] = useState({
    labels: ["Completed", "Pending", "Overdue"],
    datasets: [
      { data: [], backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"] },
    ],
  });

  const fetchUserData = () => {
    const url = window.location.pathname;
    const id = url.substring(url.lastIndexOf("/") + 1);
    fetch("http://localhost:3000/api/task_by_user/" + id, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        const fetchedTasks = response.data;
        setTasks(fetchedTasks);
        updateChartData(fetchedTasks);
      })
      .catch((error) => console.error("Error:", error));
  };

  const updateChartData = (fetchedTasks) => {
    const highPriority = fetchedTasks.filter(
      (task) => task.priority.priority === "High"
    ).length;
    const mediumPriority = fetchedTasks.filter(
      (task) => task.priority.priority === "Medium"
    ).length;
    const lowPriority = fetchedTasks.filter(
      (task) => task.priority.priority === "Low"
    ).length;

    const completed = fetchedTasks.filter(
      (task) => task.status.status === "Completed"
    ).length;
    const pending = fetchedTasks.filter(
      (task) => task.status.status === "Pending"
    ).length;
    const overdue = fetchedTasks.filter(
      (task) => task.status.status === "Overdue"
    ).length;

    setTaskPriorityData({
      labels: ["High Priority", "Medium Priority", "Low Priority"],
      datasets: [
        {
          label: "Number of Tasks",
          data: [highPriority, mediumPriority, lowPriority],
          backgroundColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
          borderColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
          borderWidth: 1,
        },
      ],
    });

    setTaskStatusData({
      labels: ["Completed", "Pending", "Overdue"],
      datasets: [
        {
          data: [completed, pending, overdue],
          backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        },
      ],
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to format the due date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to fetch priorities and statuses and update the modal options
  const handlePriorityAndStatus = () => {
    // Fetch priority data
    fetch("http://localhost:3000/api/priority", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((priorityResponse) => {
        setPriorityOptions(priorityResponse.data); // Save fetched priority options
      })
      .catch((error) => console.error("Error fetching priority data:", error));

    // Fetch status data
    fetch("http://localhost:3000/api/status", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((statusResponse) => {
        setStatusOptions(statusResponse.data); // Save fetched status options
      })
      .catch((error) => console.error("Error fetching status data:", error));
  };

  const handleAddTask = () => {
    // Send a POST request to save the new task to the backend
    fetch("http://localhost:3000/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newTask), // Convert new task data to JSON
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          // Refresh tasks from the server
          fetchUserData();
          setShowModal(false); // Close modal after task is added
        } else {
          console.error("Error adding task:", response.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>Task Priority Overview</h4>
            </Card.Header>
            <Card.Body>
              <Bar data={taskPriorityData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h4>Task Completion Status</h4>
            </Card.Header>
            <Card.Body>
              <Doughnut data={taskStatusData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <h4>Upcoming Deadlines</h4>
              <Button
                variant="primary"
                onClick={() => {
                  setShowModal(true); // This opens the modal
                  handlePriorityAndStatus(); // Fetch and populate modal options
                }}
              >
                Add Task
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task._id}>
                      <td>{index + 1}</td>
                      <td>{task.task}</td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>{task.priority.priority}</td>
                      <td>{task.status.status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for adding new task */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Task</Form.Label>
              <Form.Control
                type="text"
                value={newTask.task}
                onChange={(e) =>
                  setNewTask({ ...newTask, task: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <option value="">Select Priority</option>
                {priorityOptions.map((priority) => (
                  <option key={priority._id} value={priority._id}>
                    {priority.priority}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <option value="">Select Status</option>
                {statusOptions.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
