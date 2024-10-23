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

  const formatDate = (timestamp) => {
    if (typeof timestamp !== "number") {
      return "Invalid date";
    }
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
    const url = window.location.pathname;
    const userId = url.substring(url.lastIndexOf("/") + 1); // Get user ID from the URL

    // Check if dueDate is valid
    if (!newTask.dueDate) {
      console.error("Due date is required.");
      return; // Exit if no due date is set
    }

    // Convert dueDate to a timestamp
    const dueDate = new Date(newTask.dueDate);
    const dueDateTimestamp = dueDate.getTime() / 1000; // Convert to seconds

    // Check if the dueDate is valid after conversion
    if (isNaN(dueDateTimestamp)) {
      console.error("Invalid due date:", newTask.dueDate);
      return; // Exit if the date conversion failed
    }

    // Format the due date to MM/DD/YYYY
    const formattedDueDate = `${
      dueDate.getMonth() + 1
    }/${dueDate.getDate()}/${dueDate.getFullYear()}`;

    const taskData = {
      task: newTask.task,
      priority: newTask.priority,
      dueDate: formattedDueDate, // Use the formatted date here
      status: newTask.status,
      userName: userId, // Add user ID to the task data
    };

    // Send a POST request to save the new task to the backend
    fetch("http://localhost:3000/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(taskData), // Convert task data to JSON
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          // Refresh tasks from the server
          fetchUserData();
          setShowModal(false); // Close modal after task is added
          // Reset the newTask state to clear the modal fields
          setNewTask({
            task: "",
            priority: "",
            dueDate: "",
            status: "",
          });
        } else {
          console.error("Error adding task:", response.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      fetch(`http://localhost:3000/api/task/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            fetchUserData(); // Refresh the task list after deletion
          } else {
            console.error("Error deleting task:", response.message);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
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
                    <th>Actions</th> {/* New column for actions */}
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
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteTask(task._id)} // Handle delete action
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for adding a new task */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTask">
              <Form.Label>Task</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task name"
                value={newTask.task}
                onChange={(e) =>
                  setNewTask({ ...newTask, task: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <option value="">Select Priority</option>
                {priorityOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.priority}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <option value="">Select Status</option>
                {statusOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.status}
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
