/**
 * TaskFlow - Main Controller
 * Integrated with Bootstrap & jQuery
 * Author: Nico Péndola Díaz
 */

import { Task, TaskFlowManager } from "./Task.js";
import { fetchDailySugerence } from "./api.js";

(() => {
  "use strict";

  // State
  const manager = new TaskFlowManager();
  let currentFilter = "all";
  let editModalInstance = null; // Instancia única del modal de edición

  // DOM Elements (jQuery)
  const $taskList = $("#taskList");
  const $taskForm = $("#taskForm");
  const $stats = {
    total: $("#statTotal"),
    completed: $("#statCompleted"),
  };
  const $emptyState = $("#emptyState");

  /**
   * Renderiza el listado de tareas basándose en el filtro actual
   */
  const renderTasks = () => {
    const tasks = manager.getTasks(currentFilter);
    $taskList.empty();

    if (tasks.length === 0) {
      $emptyState.show();
      $taskList.append($emptyState);
    } else {
      $emptyState.hide();
      tasks.forEach(task => {
        let cardHtml;

        if (currentFilter === 'deleted') {
          // Tarjeta de archivo para tareas eliminadas (sólo lectura)
          const deletedDate = new Date(task.deletedAt).toLocaleString('es-ES', {
            day: '2-digit', month: 'short', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
          });
          cardHtml = `
            <div class="col fade-in">
              <div class="glass-card p-3 task-item task-deleted-archive" style="opacity:0.65; border-color: rgba(255,50,50,0.25);">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="w-100">
                    <div class="d-flex justify-content-between">
                      <div>
                        <span class="badge bg-danger x-small me-2">ELIMINADA</span>
                        <span class="task-title fw-bold text-decoration-line-through text-secondary">${task.title}</span>
                      </div>
                      <div class="text-end">
                        <div class="text-danger x-small opacity-75">Eliminado: ${deletedDate}</div>
                        <div class="text-secondary x-small opacity-50">Creado: ${new Date(task.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                      </div>
                    </div>
                    <div class="small text-secondary fw-light mt-1">${task.description || 'Sin descripción'}</div>
                    <span class="badge bg-dark text-secondary mt-2 x-small">${task.category}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        } else {
          // Formatear la fecha para una visualización profesional
          const createdDate = new Date(task.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
          });
          
          const updatedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }) : null;

          cardHtml = `
            <div class="col fade-in">
              <div class="glass-card p-3 task-item priority-${task.category} ${task.completed ? 'task-completed' : ''}" data-id="${task.id}">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="form-check w-100">
                    <div class="d-flex justify-content-between">
                      <div>
                        <input class="form-check-input check-task" type="checkbox" ${task.completed ? 'checked' : ''}>
                        <label class="form-check-label ms-2 task-title fw-bold clickable-title edit-task">
                          ${task.title}
                        </label>
                      </div>
                      <div class="text-end">
                        <div class="text-secondary x-small opacity-75">Creado: ${createdDate}</div>
                        ${updatedDate ? `<div class="text-info x-small opacity-75 mt-1">Actividad: ${updatedDate}</div>` : ''}
                      </div>
                    </div>
                    <div class="small text-secondary fw-light mt-1">${task.description || 'Sin descripción'}</div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <span class="badge bg-dark text-cyan x-small">${task.category}</span>
                      ${task.notes?.length ? `<span class="badge rounded-pill bg-secondary x-small opacity-75"><i class="bi bi-chat-text me-1"></i>${task.notes.length} notas</span>` : ''}
                    </div>
                  </div>
                  <div class="d-flex flex-column ms-3">
                    <button class="btn btn-link text-info btn-action edit-task mb-2 p-0" title="Ver Ficha">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                      </svg>
                    </button>
                    <button class="btn btn-link text-danger btn-action delete-task p-0" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        $taskList.append(cardHtml);
      });
    }

    updateStats();
  };

  /**
   * Actualiza el panel de estadísticas en el DOM
   */
  const updateStats = () => {
    const { total, completed } = manager.getStats();
    $stats.total.text(total);
    $stats.completed.text(completed);
  };

  /**
   * Carga la sugerencia API de forma asíncrona
   */
  const loadSuggestion = async () => {
    const suggestion = await fetchDailySugerence();
    $("#apiContent").text(`"${suggestion.content}"`);
    // Mostrar modal automáticamente después de 1 segundo (solo una vez por sesión idealmente)
    if (!sessionStorage.getItem("modalShown")) {
      setTimeout(() => {
        const modal = new bootstrap.Modal("#apiModal");
        modal.show();
        sessionStorage.setItem("modalShown", "true");
      }, 1500);
    }
  };

  // --- EVENT HANDLERS ---

  // Agregar Tarea
  $taskForm.on("submit", (e) => {
    e.preventDefault();
    const title = $("#taskTitle").val();
    const category = $("#taskCategory").val();
    const description = $("#taskDescription").val();

    manager.addTask(title, category, description);
    $taskForm[0].reset();
    renderTasks();
  });

  // Delegación de eventos para Checkbox y Delete
  $taskList.on("change", ".check-task", function () {
    const id = $(this).closest(".task-item").data("id");
    manager.toggleTask(id);
    renderTasks();
  });

  $taskList.on('click', '.delete-task', function() {
    const id = $(this).closest('.task-item').data('id');
    if (confirm('¿Seguro que deseas eliminar esta tarea? Se guardará registro de la fecha de eliminación.')) {
      manager.deleteTask(id);
      renderTasks();
    }
  });

  // Abrir Modal de Ficha de Tarea (Espacio de Trabajo)
  $taskList.on('click', '.edit-task', function(e) {
    // Evitar que el checkbox dispare el modal
    if ($(e.target).hasClass('check-task') || $(e.target).closest('.check-task').length) return;
    
    const id = String($(this).closest('.task-item').data('id'));
    const task = manager.tasks.find(t => String(t.id) === id);

    if (task) {
      $('#editTaskId').val(task.id);
      $('#editTaskTitle').val(task.title);
      $('#editTaskCategory').val(task.category);
      $('#editTaskDescription').val(task.description || '');
      $('#newNote').val('');
      
      renderNotes(task);

      // Reutilizar instancia única del modal para evitar problemas con múltiples instancias
      if (!editModalInstance) {
        editModalInstance = new bootstrap.Modal('#editModal', { keyboard: true, backdrop: true });
      }
      editModalInstance.show();
    }
  });

  /**
   * Renderiza el log de notas en el modal
   */
  const renderNotes = (task) => {
    const $notesContainer = $('#notesContainer');
    $notesContainer.empty();

    if (!task.notes || task.notes.length === 0) {
      $notesContainer.append(`
        <div class="text-center py-4 text-secondary opacity-50 small">
          Sin anotaciones registradas. Empieza a documentar tu avance.
        </div>
      `);
    } else {
      // Ordenar por fecha descendente (última primero)
      [...task.notes].reverse().forEach(note => {
        const date = new Date(note.date).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        $notesContainer.append(`
          <div class="note-item">
            <span class="note-date fw-bold text-cyan">${date}</span>
            <div class="note-text text-light">${note.text}</div>
          </div>
        `);
      });
    }
  };

  // Agregar Nota
  $('#btnAddNote').on('click', function() {
    const id = String($('#editTaskId').val());
    const noteText = $('#newNote').val();
    
    if (!noteText || noteText.trim() === "") {
      alert('Por favor escribe una anotación.');
      return;
    }

    const task = manager.tasks.find(t => String(t.id) === id);
    if (task) {
      // Asegurar que el objeto tiene el prototipo correcto (si viene de JSON)
      Object.setPrototypeOf(task, Task.prototype);
      
      task.addNote(noteText);
      manager.saveToStorage();
      $('#newNote').val('');
      renderNotes(task);
      renderTasks(); // Actualizar contador y fecha en la lista
    }
  });

  // Guardar Cambios de Cabecera (Título, Cat, Desc)
  $('#editForm').on('submit', function(e) {
    e.preventDefault();
    const id = String($('#editTaskId').val());
    const title = $('#editTaskTitle').val().trim();
    const category = $('#editTaskCategory').val();
    const description = $('#editTaskDescription').val().trim();

    if (!title) {
      alert('El título no puede estar vacío.');
      return;
    }

    manager.updateTask(id, title, category, description);
    renderTasks();

    // Actualizar el log de notas con la fecha de modificación actualizada
    const updatedTask = manager.tasks.find(t => String(t.id) === id);
    if (updatedTask) renderNotes(updatedTask);

    // Feedback visual sin cerrar el modal para que el usuario pueda seguir añadiendo notas
    const $btn = $(this).find('button[type=submit]');
    const original = $btn.text();
    $btn.text('✓ Guardado').addClass('btn-success').removeClass('btn-cyan');
    setTimeout(() => {
      $btn.text(original).removeClass('btn-success').addClass('btn-cyan');
    }, 1500);
  });

  // Marcar tarea como completada desde la Ficha de Trabajo
  $('#btnCompleteFromModal').on('click', function() {
    const id = String($('#editTaskId').val());
    const task = manager.tasks.find(t => String(t.id) === id);
    if (!task) return;

    // Si ya está completada, no hacer nada y avisar
    if (task.completed) {
      alert('Esta tarea ya está marcada como completada.');
      return;
    }

    // Marcar como completada y persistir
    Object.setPrototypeOf(task, Task.prototype);
    task.toggleStatus();
    task.updatedAt = new Date().toISOString();
    manager.saveToStorage();

    // Actualizar el botón para feedback visual
    const $btn = $(this);
    $btn.text('✅ Completada').addClass('btn-success').removeClass('btn-outline-success').prop('disabled', true);

    // Actualizar la lista en segundo plano
    renderTasks();

    // Cerrar el modal y cambiar al filtro Completadas tras un breve delay
    setTimeout(() => {
      if (editModalInstance) editModalInstance.hide();
      currentFilter = 'completed';
      $('[data-filter]').removeClass('active');
      $('[data-filter="completed"]').addClass('active');
      renderTasks();
    }, 800);
  });

  // Eliminar tarea desde la Ficha de Trabajo
  $('#btnDeleteFromModal').on('click', function() {
    const id = String($('#editTaskId').val());
    const title = $('#editTaskTitle').val() || 'esta tarea';

    if (!confirm(`¿Seguro que deseas eliminar "${title}"? La tarea pasará al historial de eliminados.`)) return;

    // Cerrar el modal antes de eliminar
    if (editModalInstance) editModalInstance.hide();

    manager.deleteTask(id);

    // Cambiar el filtro a "Eliminados" para que el usuario vea el resultado
    currentFilter = 'deleted';
    $('[data-filter]').removeClass('active');
    $('[data-filter="deleted"]').addClass('active');

    renderTasks();
  });

  // Filtros
  $("[data-filter]").on("click", function () {
    $("[data-filter]").removeClass("active");
    $(this).addClass("active");
    currentFilter = $(this).data("filter");
    renderTasks();
  });

  // Inicialización
  $(document).ready(() => {
    renderTasks();
    loadSuggestion();
  });
})();
