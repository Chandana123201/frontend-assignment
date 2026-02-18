import { useState, useEffect } from "react";

function TaskBoard() {

  // load tasks from localStorage safely
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // add new task → default Todo column
  const handleAddTask = () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title,
      status: "todo", // todo / doing / done
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setTitle("");
  };

  // move task between columns
  const moveTask = (id, newStatus) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  // delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  // reusable column UI
  const renderColumn = (status, columnTitle) => {
    return (
      <div style={{
        border: "1px solid black",
        padding: 15,
        width: 250,
        minHeight: 200
      }}>
        <h3>{columnTitle}</h3>

        {tasks
          .filter(task => task.status === status)
          .map(task => (
            <div key={task.id}
              style={{
                border: "1px solid gray",
                margin: 5,
                padding: 5
              }}
            >
              <b>{task.title}</b>

              <br />

              <button onClick={() => moveTask(task.id, "todo")}>
                Todo
              </button>

              <button onClick={() => moveTask(task.id, "doing")}>
                Doing
              </button>

              <button onClick={() => moveTask(task.id, "done")}>
                Done
              </button>

              <button onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Task Board</h1>

      {/* add task */}
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleAddTask}>Add Task</button>

      <button onClick={handleLogout} style={{ marginLeft: 10 }}>
        Logout
      </button>

      {/* 3 columns layout */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {renderColumn("todo", "Todo")}
        {renderColumn("doing", "Doing")}
        {renderColumn("done", "Done")}
      </div>

    </div>
  );
}

export default TaskBoard;


