# Arquitectura Técnica - TaskFlow (Módulo 4)

Este documento detalla la estructura y lógica de la aplicación **TaskFlow**, desarrollada como el entregable final del Módulo 4 de Programación Avanzada en JavaScript.

## 🏗️ Estructura de Archivos

- `index.html`: Estructura semántica con Bootstrap 5.3.
- `style.css`: Sistema de diseño Cyan-Blue Neon & Glassmorphism.
- `script.js`: Controlador principal (IIFE) que orquesta la UI y eventos.
- `Task.js`: Definición de clases `Task` y `TaskFlowManager` (OOP).
- `api.js`: Servicios asíncronos para consumo de APIs externas.

## 💻 Tecnologías y Patrones

1.  **OOP (Programación Orientada a Objetos)**: 
    - Uso de clases para el modelado de datos y lógica de negocio.
    - Encapsulamiento de la gestión de tareas en `TaskFlowManager`.
2.  **JS Moderno (ES6+)**:
    - `Modulos`: Uso de `import/export` para separación de responsabilidades.
    - `Async/Await`: Manejo de promesas para la obtención de datos externos.
    - `IIFE`: Función autoejecutable en el controlador principal para evitar contaminación del scope global.
3.  **Persistencia**:
    - Implementación de `localStorage` para asegurar que las tareas persistan entre sesiones del navegador.
4.  **UI/UX Frameworks**:
    - **jQuery 3.7.1**: Manipulación eficiente del DOM y delegación de eventos.
    - **Bootstrap 5.3**: Layout responsivo y componentes modales.

## 🛡️ Seguridad y Calidad

- Sanatización de inputs mediante creación segura de elementos en el DOM (jQuery `.text()` o templetes controlados).
- Validación de formulario antes de la instanciación de clases.
- Arquitectura desacoplada: La vista (`index.html`) no conoce la lógica de persistencia, solo interactúa con el Manager.

## 🚀 Secuencia de Implementación

1.  Diseño de base visual (CSS Custom Properties + Glassmorphism).
2.  Modelado de la clase `Task` y su Manager.
3.  Implementación de servicios `async` para API motivacional.
4.  Integración de eventos con jQuery y renderizado dinámico.
5.  Persistencia y filtros de estado.
