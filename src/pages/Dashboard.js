import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "../static/dashboard.css";

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
    category: "",
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedStatusId, setSelectedStatusId] = useState("");
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
        setTasks(response.data || []);
        if (response.data && response.data.length > 0) {
          setDateToEdit(response.data[0].dueDate);
        }
        updateChartData(response.data || []);
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
    fetchOptions();
  }, []);

  const fetchOptions = () => {
    fetch("https://task-management-api-maa5.onrender.com/api/priority", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setPriorityOptions(res.data || []))
      .catch((error) => console.error("Error fetching priorities:", error));

    fetch("https://task-management-api-maa5.onrender.com/api/status", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setStatusOptions(res.data || []))
      .catch((error) => console.error("Error fetching statuses:", error));

    fetch("https://task-management-api-maa5.onrender.com/api/category", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setCategoryOptions(res.data || []))
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const handleAddTask = () => {
    const userId = window.location.pathname.split("/").pop();
    const dueDate = new Date(newTask.dueDate).toISOString();
    fetch("https://task-management-api-maa5.onrender.com/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...newTask,
        dueDate,
        userName: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          fetchUserData();
          setShowModal(false);
          setNewTask({ task: "", priority: "", dueDate: "", status: "", category: "" });
        }
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const responsiveStyle = {
    container: {
      padding: "15px",
      margin: "auto",
      maxWidth: "100%",
    },
    chartRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "15px",
    },
    chartCol: {
      flex: "1 1 calc(50% - 15px)",
      minWidth: "300px",
    },
  };

  return (
    <Container style={responsiveStyle.container}>
      <Row>
        <Col>
          <h1>Dashboard</h1>
          <Button onClick={() => setShowModal(true)} style={{ marginRight: "10px" }}>
            Add Task
          </Button>
        </Col>
      </Row>
      <Row style={responsiveStyle.chartRow}>
        <Col style={responsiveStyle.chartCol}>
          <Bar data={taskPriorityData} options={{ responsive: true }} />
        </Col>
        <Col style={responsiveStyle.chartCol}>
          <Doughnut data={taskStatusData} options={{ responsive: true }} />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
