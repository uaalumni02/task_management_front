import React from "react";
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
  // Fake Data for Task Management
  const taskPriorityData = {
    labels: ["High Priority", "Medium Priority", "Low Priority"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [10, 25, 15], // Example: 10 high priority, 25 medium, 15 low
        backgroundColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
        borderColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
        borderWidth: 1,
      },
    ],
  };

  const taskStatusData = {
    labels: ["Completed", "Pending", "Overdue"],
    datasets: [
      {
        data: [40, 30, 10], // Example: 40 tasks completed, 30 pending, 10 overdue
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
      },
    ],
  };

  // Fake Task List with due dates and priorities
  const tasks = [
    {
      id: 1,
      title: "Prepare Presentation",
      dueDate: "2024-10-10",
      priority: "High",
      status: "Pending",
    },
    {
      id: 2,
      title: "Submit Report",
      dueDate: "2024-10-08",
      priority: "Medium",
      status: "Overdue",
    },
    {
      id: 3,
      title: "Fix Bug in App",
      dueDate: "2024-10-12",
      priority: "Low",
      status: "Pending",
    },
    {
      id: 4,
      title: "Update Website",
      dueDate: "2024-10-06",
      priority: "High",
      status: "Completed",
    },
    {
      id: 5,
      title: "Email Client",
      dueDate: "2024-10-09",
      priority: "Medium",
      status: "Pending",
    },
  ];

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
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>{task.title}</td>
                      <td>{task.dueDate}</td>
                      <td>{task.priority}</td>
                      <td>{task.status}</td>
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
