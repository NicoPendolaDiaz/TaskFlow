/**
 * TaskFlow - OOP Logic
 * Author: Nico (Architect)
 */

export class Task {
  constructor(id, title, category, description, completed = false) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.description = description;
    this.completed = completed;
    this.createdAt = new Date().toISOString();
  }

  toggleStatus() {
    this.completed = !this.completed;
  }
}

export class TaskFlowManager {
  constructor() {
    this.tasks = this.loadFromStorage();
  }

  addTask(title, category, description) {
    const id = Date.now().toString();
    const newTask = new Task(id, title, category, description);
    this.tasks.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveToStorage();
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      // Re-instanciar para recuperar métodos si viene de JSON
      if (!(task instanceof Task)) {
        Object.setPrototypeOf(task, Task.prototype);
      }
      task.toggleStatus();
      this.saveToStorage();
    }
  }

  getTasks(filter = "all") {
    switch (filter) {
      case "completed":
        return this.tasks.filter((t) => t.completed);
      case "pending":
        return this.tasks.filter((t) => !t.completed);
      default:
        return this.tasks;
    }
  }

  getStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter((t) => t.completed).length,
    };
  }

  saveToStorage() {
    localStorage.setItem("taskflow_data", JSON.stringify(this.tasks));
  }

  loadFromStorage() {
    const data = localStorage.getItem("taskflow_data");
    if (!data) return [];

    const parsed = JSON.parse(data);
    // Hidratar objetos para que sean instancias de Task
    return parsed.map(
      (t) => new Task(t.id, t.title, t.category, t.description, t.completed),
    );
  }
}
