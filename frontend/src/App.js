import { useState, useEffect } from "react";

function App() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const response = await fetch("http://localhost:8000/jobs");
    const data = await response.json();
    setJobs(data.jobs);
  };

  const addJob = async () => {
    await fetch("http://localhost:8000/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, status }),
    });
    setCompany("");
    setRole("");
    setStatus("Applied");
    fetchJobs();
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Job Tracker</h1>

      <h2>Add a Job</h2>
      <input
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ marginRight: "10px", padding: "8px" }}
      />
      <input
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ marginRight: "10px", padding: "8px" }}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ marginRight: "10px", padding: "8px" }}
      >
        <option>Applied</option>
        <option>Interview</option>
        <option>Rejected</option>
        <option>Offer</option>
      </select>
      <button
        onClick={addJob}
        style={{ padding: "8px 16px", cursor: "pointer" }}
      >
        Add Job
      </button>

      <h2>My Applications</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.company}</td>
              <td>{job.role}</td>
              <td>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
