import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "",
    dueDate: "",
    status: "",
    category: "", // Added category field
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null); // State to hold selected task ID
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
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

  // Filter state
  const [filter, setFilter] = useState({
    dueDate: "",
    status: "",
    category: "",
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

    // Fetch priority options on component mount
    fetch("http://localhost:3000/api/priority", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((priorityResponse) => {
        setPriorityOptions(priorityResponse.data); // Save fetched priority options
      })
      .catch((error) => console.error("Error fetching priority data:", error));

    // Fetch status options on component mount
    fetch("http://localhost:3000/api/status", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((statusResponse) => {
        setStatusOptions(statusResponse.data); // Save fetched status options
      })
      .catch((error) => console.error("Error fetching status data:", error));

    // Fetch category options on component mount
    fetch("http://localhost:3000/api/category", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((categoryResponse) => {
        setCategoryOptions(categoryResponse.data); // Save fetched category options
      })
      .catch((error) => console.error("Error fetching category data:", error));
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
      category: newTask.category, // Include category in task data
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
            category: "", // Reset category
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

  const filteredTasks = tasks.filter((task) => {
    // Get the due date from the task
    const dueDateInput = task.dueDate;

    // Create a new Date object, assuming dueDateInput is a Unix timestamp in seconds
    const taskDueDate = new Date(dueDateInput * 1000); // Convert to milliseconds
    const taskDueDateFormatted = taskDueDate.toLocaleDateString("en-US"); // Format the date

    const matchesDueDate =
      filter.dueDate === "" || taskDueDateFormatted === filter.dueDate; // Compare formatted date with filter

    const matchesStatus =
      filter.status === "" || task.status.status === filter.status;
    const matchesCategory =
      filter.category === "" || task.category.category === filter.category;

    return matchesDueDate && matchesStatus && matchesCategory;
  });

  const handleShowStatusModal = (taskId) => {
    setSelectedTaskId(taskId); // Store the selected task ID
    setShowStatusModal(true); // Show the status modal
  };

  const handleUpdateStatus = (newStatus) => {
    // Send a PATCH request to update the task status
    const taskUpdateData = {
      status: newStatus, // Update the task status
    };

    fetch(`http://localhost:3000/api/task/${selectedTaskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(taskUpdateData), // Convert task update data to JSON
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          fetchUserData(); // Refresh the task list after updating
          setShowStatusModal(false); // Close the status modal
        } else {
          console.error("Error updating task status:", response.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Task Overview</Card.Title>
              <Button onClick={() => setShowModal(true)}>Add Task</Button>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.task}</td>
                      <td>{task.priority.priority}</td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        {task.status.status}{" "}
                        <Button
                          onClick={() => handleShowStatusModal(task._id)}
                          variant="link"
                        >
                          Change Status
                        </Button>
                      </td>
                      <td>{task.category.categoryName}</td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteTask(task._id)}
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
        <Col md={4}>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Task Priority Distribution</Card.Title>
              <Bar data={taskPriorityData} />
            </Card.Body>
          </Card>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Task Status Distribution</Card.Title>
              <Doughnut data={taskStatusData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Task Modal */}
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
                value={newTask.task}
                onChange={(e) =>
                  setNewTask({ ...newTask, task: e.target.value })
                }
                placeholder="Enter task description"
              />
            </Form.Group>
            <Form.Group controlId="formPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <option value="">Select priority</option>
                {priorityOptions.map((priority) => (
                  <option key={priority._id} value={priority._id}>
                    {priority.priority}
                  </option>
                ))}
              </Form.Control>
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
              <Form.Control
                as="select"
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <option value="">Select status</option>
                {statusOptions.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.status}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </Form.Control>
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

      {/* Update Status Modal */}

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Task Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStatusUpdate">
              <Form.Label>Select New Status</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option value="">Select status</option>
                {statusOptions.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.status}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleUpdateStatus(selectedTaskId)}
          >
            {" "}
            {/* Adjust this if you want to explicitly save changes */}
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
