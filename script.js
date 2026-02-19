/**
 * TaskFlow - Main Controller
 * Integrated with Bootstrap & jQuery
 * Author: Nico (Architect)
 */

import { TaskFlowManager } from './Task.js';
import { fetchDailySugerence } from './api.js';

(() => {
  'use strict';

  // State
  const manager = new TaskFlowManager();
  let currentFilter = 'all';

  // DOM Elements (jQuery)
  const $taskList = $('#taskList');
  const $taskForm = $('#taskForm');
  const $stats = {
    total: $('#statTotal'),
    completed: $('#statCompleted')
  };
  const $emptyState = $('#emptyState');

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
        const cardHtml = `
          <div class="col fade-in">
            <div class="glass-card p-3 task-item priority-${task.category} ${task.completed ? 'task-completed' : ''}" data-id="${task.id}">
              <div class="d-flex justify-content-between align-items-center">
                <div class="form-check">
                  <input class="form-check-input check-task" type="checkbox" ${task.completed ? 'checked' : ''}>
                  <label class="form-check-label ms-2 task-title fw-bold">
                    ${task.title}
                  </label>
                  <div class="small text-secondary fw-light">${task.description || 'Sin descripción'}</div>
                  <span class="badge bg-dark text-cyan mt-1 x-small">${task.category}</span>
                </div>
                <button class="btn btn-link text-danger btn-action delete-task">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
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
    $('#apiContent').text(`"${suggestion.content}"`);
    // Mostrar modal automáticamente después de 1 segundo (solo una vez por sesión idealmente)
    if (!sessionStorage.getItem('modalShown')) {
      setTimeout(() => {
        const modal = new bootstrap.Modal('#apiModal');
        modal.show();
        sessionStorage.setItem('modalShown', 'true');
      }, 1500);
    }
  };

  // --- EVENT HANDLERS ---

  // Agregar Tarea
  $taskForm.on('submit', (e) => {
    e.preventDefault();
    const title = $('#taskTitle').val();
    const category = $('#taskCategory').val();
    const description = $('#taskDescription').val();

    manager.addTask(title, category, description);
    $taskForm[0].reset();
    renderTasks();
  });

  // Delegación de eventos para Checkbox y Delete
  $taskList.on('change', '.check-task', function() {
    const id = $(this).closest('.task-item').data('id');
    manager.toggleTask(id);
    renderTasks();
  });

  $taskList.on('click', '.delete-task', function() {
    const id = $(this).closest('.task-item').data('id');
    if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
      manager.deleteTask(id);
      renderTasks();
    }
  });

  // Filtros
  $('[data-filter]').on('click', function() {
    $('[data-filter]').removeClass('active');
    $(this).addClass('active');
    currentFilter = $(this).data('filter');
    renderTasks();
  });

  // Inicialización
  $(document).ready(() => {
    renderTasks();
    loadSuggestion();
  });

})();
