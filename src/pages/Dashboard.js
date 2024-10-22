import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
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
            <Card.Header>
              <h4>Upcoming Deadlines</h4>
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
                      <td>{task.dueDate}</td>
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
    </Container>
  );
};

export default Dashboard;
