/**
 * TaskFlow - OOP Logic
 * Author: Nico Péndola Díaz
 */

export class Task {
  constructor(id, title, category, description, completed = false) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.description = description;
    this.completed = completed;
    this.createdAt = new Date().toISOString();
    this.updatedAt = null;
    this.deletedAt = null;
    this.notes = []; // Historial de anotaciones del usuario
  }

  // Actualiza los datos de la tarea y registra la fecha de modificación
  update(title, category, description) {
    this.title = title;
    this.category = category;
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  // Agrega una nueva nota al historial "Log de Trabajo"
  addNote(text) {
    if (!text || text.trim() === "") return;
    this.notes.push({
      text: text.trim(),
      date: new Date().toISOString()
    });
    this.updatedAt = new Date().toISOString();
  }

  // Cambia el estado de la tarea (Pendiente/Completada)
  toggleStatus() {
    this.completed = !this.completed;
  }
}

export class TaskFlowManager {
  constructor() {
    this.tasks = this.loadFromStorage();
    this.deletedTasks = this.loadDeletedFromStorage();
  }

  // Agrega una nueva tarea a la colección y persiste los datos
  addTask(title, category, description) {
    const id = Date.now().toString();
    const newTask = new Task(id, title, category, description);
    this.tasks.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  // Elimina una tarea, registrando la fecha de eliminación para auditoría
  deleteTask(id) {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      const task = this.tasks[taskIndex];
      task.deletedAt = new Date().toISOString();
      this.deletedTasks.push(task);
      this.tasks.splice(taskIndex, 1);
      this.saveToStorage();
      this.saveDeletedToStorage();
    }
  }

  // Actualiza una tarea existente
  updateTask(id, title, category, description) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      // Hidratar si es necesario
      if (!(task instanceof Task)) {
        Object.setPrototypeOf(task, Task.prototype);
      }
      task.update(title, category, description);
      this.saveToStorage();
    }
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
      case "deleted":
        return this.deletedTasks; // Retorna el archivo de tareas eliminadas
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

  saveDeletedToStorage() {
    localStorage.setItem("taskflow_deleted", JSON.stringify(this.deletedTasks));
  }

  loadFromStorage() {
    const data = localStorage.getItem("taskflow_data");
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.map(
      (t) => {
        const task = new Task(t.id, t.title, t.category, t.description, t.completed);
        task.createdAt = t.createdAt;
        task.updatedAt = t.updatedAt;
        task.deletedAt = t.deletedAt;
        task.notes = t.notes || []; // Restaurar historial de notas
        return task;
      },
    );
  }

  loadDeletedFromStorage() {
    const data = localStorage.getItem("taskflow_deleted");
    if (!data) return [];
    return JSON.parse(data);
  }
}
