import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../static/dashboard.css";

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
  const [taskToEdit, setTaskToEdit] = useState("");
  const [userToEdit, setUserToEdit] = useState("");
  const [dateToEdit, setDateToEdit] = useState("");
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
  const [selectedStatusId, setSelectedStatusId] = useState(""); // State to hold selected status ID
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
    fetch("https://task-management-api-maa5.onrender.com/api/task_by_user/" + id, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        // Check if response.data has at least one task before setting dateToEdit
        if (response.data && response.data.length > 0) {
          setDateToEdit(response.data[0].dueDate);
        } else {
          setDateToEdit(undefined); // Or set to null or any default value if needed
        }

        const fetchedTasks = response.data || []; // Ensure fetchedTasks is an empty array if no tasks are found
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
    fetch("https://task-management-api-maa5.onrender.com/api/priority", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((priorityResponse) => {
        setPriorityOptions(priorityResponse.data); // Save fetched priority options
      })
      .catch((error) => console.error("Error fetching priority data:", error));

    // Fetch status options on component mount
    fetch("https://task-management-api-maa5.onrender.com/api/status", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((statusResponse) => {
        setStatusOptions(statusResponse.data); // Save fetched status options
      })
      .catch((error) => console.error("Error fetching status data:", error));

    // Fetch category options on component mount
    fetch("https://task-management-api-maa5.onrender.com/api/category", {
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
    fetch("https://task-management-api-maa5.onrender.com/api/task", {
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
      fetch(`https://task-management-api-maa5.onrender.com/api/task/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            console.log(response);
            fetchUserData(); // Refresh the task list after confirming and deleting
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
    console.log("Task due date:", taskDueDate);

    // Format dueDateInput into MM/DD/YYYY format
    const formattedDueDateInput = [
      String(taskDueDate.getUTCMonth() + 1).padStart(2, "0"), // Month (0-11)
      String(taskDueDate.getUTCDate()).padStart(2, "0"), // Day (1-31)
      taskDueDate.getUTCFullYear(), // Full Year
    ].join("/");

    console.log("Formatted Due Date Input:", formattedDueDateInput);

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

    console.log("Formatted Filter due date:", formattedFilterDueDate);

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

  const formattedDate = new Date(dateToEdit * 1000); // Convert to milliseconds

  const dueDate = `${(formattedDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${formattedDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${formattedDate.getFullYear().toString().slice(-2)}`;

  const handleUpdateStatus = (taskId) => {
    fetch(`https://task-management-api-maa5.onrender.com/api/task/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        task: taskToEdit,
        userName: userToEdit,
        dueDate: dueDate, // Use the formatted due date
        status: selectedStatusId,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          fetchUserData(); // Refresh the task list after updating
          setShowStatusModal(false); // Close the status modal
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const navigate = useNavigate();

  // Function to clear cookies
  const clearCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  // Function to handle logout
  const handleLogout = () => {
    clearCookies();
    navigate("/"); // Redirect to root route
  };

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
      <Row>
        <Col>
          <h1>Dashboard</h1>

          <Button
            onClick={() => setShowModal(true)}
            style={{ marginRight: "10px" }}
          >
            Add Task
          </Button>
          <Button variant="dark" size="md" onClick={handleLogout}>
            Logout
          </Button>

          <h2>Task Statistics</h2>
          <Row>
            <Col>
              <Bar data={taskPriorityData} options={{ responsive: true }} />
            </Col>
            <Col>
              <Doughnut data={taskStatusData} options={{ responsive: true }} />
            </Col>
          </Row>

          <h1>Filter</h1>

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

          <br></br>

          <Button
            variant="success"
            className="clear-filters-button" // This will now apply margin from CSS
            onClick={clearFilters}
            style={{
              padding: "5px 20px",
              borderRadius: "5px",
              transition: "background-color 0.3s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i
              className="fas fa-times-circle"
              style={{ marginRight: "5px" }}
            ></i>
            Clear Filters
          </Button>

          <br></br>
          <br></br>

          <h2>Task List</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Category</th> {/* Add Category header */}
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
                  <td>{task.category.categoryName}</td>{" "}
                  {/* Display task category */}
                  <td>
                    <Button
                      onClick={() => {
                        setTaskToEdit(task.task);
                        setUserToEdit(task.userName._id);
                        setSelectedTaskId(task._id);
                        setShowStatusModal(true);
                      }}
                    >
                      Update Status
                    </Button>{" "}
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
            Save Task
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
            <Form.Group controlId="formTaskToEdit">
              <Form.Label>Task</Form.Label>
              <Form.Control type="text" value={taskToEdit} readOnly />
            </Form.Group>
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => setSelectedStatusId(e.target.value)} // Update selectedStatusId on change
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
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
