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
    category: "", // Added category field
  });
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
    const taskDueDate = new Date(dueDateInput * 1000);

    // Format dueDateInput into MM/DD/YYYY format
    const formattedDueDateInput = [
      String(taskDueDate.getUTCMonth() + 1).padStart(2, "0"), // Month (0-11)
      String(taskDueDate.getUTCDate()).padStart(2, "0"), // Day (1-31)
      taskDueDate.getUTCFullYear(), // Full Year
    ].join("/");

    // Create a Date object for filter.dueDate
    let filterDueDate;

    if (typeof filter.dueDate === "number") {
      // If it's a Unix timestamp in seconds, convert it to milliseconds
      filterDueDate = new Date(filter.dueDate * 1000);
    } else {
      filterDueDate = new Date(filter.dueDate);
    }

    // Format filter.dueDate to MM/DD/YYYY format if it is provided
    const formattedFilterDueDate = filter.dueDate
      ? [
          String(filterDueDate.getUTCMonth() + 1).padStart(2, "0"), // Month (0-11)
          String(filterDueDate.getUTCDate()).padStart(2, "0"), // Day (1-31)
          filterDueDate.getUTCFullYear(), // Full Year
        ].join("/")
      : "";

    const matchesDate = formattedFilterDueDate
      ? formattedDueDateInput === formattedFilterDueDate // Compare formatted task due date to filter's due date
      : true;

    const matchesStatus = filter.status
      ? task.status._id === filter.status
      : true;

    const matchesCategory = filter.category
      ? task.category._id === filter.category
      : true;

    return matchesDate && matchesStatus && matchesCategory;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilter({
      dueDate: "",
      status: "",
      category: "",
    });
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Card>
            <Card.Header>
              <h3>Dashboard</h3>
              <Button >Logout</Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Bar data={taskPriorityData} />
                </Col>
                <Col md={6}>
                  <Doughnut data={taskStatusData} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="my-4">
        <Col>
          <Card>
            <Card.Header>
              <h3>Task List</h3>
              <Button onClick={() => setShowModal(true)}>Add Task</Button>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Card className="mb-3">
                <Card.Header>Filters</Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={filter.dueDate}
                            onChange={(e) =>
                              setFilter({ ...filter, dueDate: e.target.value })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={filter.status}
                            onChange={(e) =>
                              setFilter({ ...filter, status: e.target.value })
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
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            value={filter.category}
                            onChange={(e) =>
                              setFilter({ ...filter, category: e.target.value })
                            }
                          >
                            <option value="">Select Category</option>
                            {categoryOptions.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.categoryName}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="outline-secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
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
                      <td>{task.status.status}</td>
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
      </Row>

      {/* Add Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
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
            <Form.Group>
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
            <Form.Group>
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
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
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
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
