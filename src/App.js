import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

  // LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("user") === "loggedIn"
  );

  // TASK STATE (load from storage safely)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("taskBoard");
    return saved
      ? JSON.parse(saved)
      : { todo: [], doing: [], done: [] };
  });

  const [dragItem, setDragItem] = useState(null);

  // FORM STATE
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: ""
  });

  // EDIT STATE
  const [editIndex, setEditIndex] = useState(null);
  const [editColumn, setEditColumn] = useState(null);

  // LOGIN INPUTS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SEARCH + FILTER + SORT STATE
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [sortOrder, setSortOrder] = useState("none");

  // SAVE tasks automatically
  useEffect(() => {
    localStorage.setItem("taskBoard", JSON.stringify(tasks));
  }, [tasks]);

  // LOGIN
  const handleLogin = () => {
    if (email === "intern@demo.com" && password === "intern123") {
      localStorage.setItem("user", "loggedIn");
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  // FORM CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ADD / UPDATE TASK
  const addTask = () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    const newTask = {
      ...form,
      createdAt: new Date().toLocaleString()
    };

    if (editIndex !== null) {
      const updatedColumn = [...tasks[editColumn]];
      updatedColumn[editIndex] = newTask;

      setTasks({
        ...tasks,
        [editColumn]: updatedColumn
      });

      setEditIndex(null);
      setEditColumn(null);
    } else {
      setTasks({
        ...tasks,
        todo: [...tasks.todo, newTask]
      });
    }

    setForm({
      title: "",
      description: "",
      priority: "Low",
      dueDate: ""
    });
  };

  // DELETE TASK
  const deleteTask = (column, index) => {
    const updated = [...tasks[column]];
    updated.splice(index, 1);

    setTasks({
      ...tasks,
      [column]: updated
    });
  };

  // EDIT TASK
  const editTask = (column, index) => {
    const task = tasks[column][index];
    setForm(task);
    setEditIndex(index);
    setEditColumn(column);
  };

  // DRAG START
  const handleDragStart = (column, index) => {
    setDragItem({ column, index });
  };

  // DROP TASK
  const handleDrop = (targetColumn) => {
    if (!dragItem) return;

    const sourceColumn = dragItem.column;
    const sourceIndex = dragItem.index;

    const movedTask = tasks[sourceColumn][sourceIndex];

    const newSourceTasks = [...tasks[sourceColumn]];
    newSourceTasks.splice(sourceIndex, 1);

    const newTargetTasks = [...tasks[targetColumn], movedTask];

    setTasks({
      ...tasks,
      [sourceColumn]: newSourceTasks,
      [targetColumn]: newTargetTasks
    });

    setDragItem(null);
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={handleLogin}>Login</button>

        <p>Use: intern@demo.com / intern123</p>
      </div>
    );
  }

  // TASK BOARD UI
  return (
    <div style={{ padding: 20 }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Task Board</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* SEARCH + FILTER + SORT */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button onClick={() =>
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        }>
          Sort by Due Date
        </button>
      </div>

      {/* TASK FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          name="title"
          placeholder="Title (required)"
          value={form.title}
          onChange={handleChange}
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        <button onClick={addTask}>
          {editIndex !== null ? "Update Task" : "Add Task"}
        </button>
      </div>

      {/* COLUMNS */}
      <div style={{ display: "flex", gap: 20 }}>
        {["todo", "doing", "done"].map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
            style={{
              border: "1px solid black",
              padding: 10,
              width: 250,
              minHeight: 200
            }}
          >
            <h3>{col.toUpperCase()}</h3>

            {tasks[col]
              .filter((task) =>
                task.title.toLowerCase().includes(search.toLowerCase())
              )
              .filter((task) =>
                filterPriority === "All"
                  ? true
                  : task.priority === filterPriority
              )
              .sort((a, b) => {
                if (sortOrder === "none") return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return sortOrder === "asc"
                  ? new Date(a.dueDate) - new Date(b.dueDate)
                  : new Date(b.dueDate) - new Date(a.dueDate);
              })
              .map((task, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(col, i)}
                  style={{
                    border: "1px solid gray",
                    padding: 8,
                    marginBottom: 10
                  }}
                >
                  <b>{task.title}</b>
                  <p>{task.description}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Due: {task.dueDate || "N/A"}</p>
                  <small>{task.createdAt}</small>
                  <br />
                  <button onClick={() => editTask(col, i)}>Edit</button>
                  <button onClick={() => deleteTask(col, i)}>Delete</button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;













