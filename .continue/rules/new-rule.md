# Project Overview
This is a Vue 3 project.

# Framework
- Vue 3
- Composition API
- Vite
- Vue Router
- Pinia Stores

# Project Structure
- src/components = reusable UI components
- src/views = page-level views
- src/router = routing configuration
- src/stores = global state management

# File Responsibilities

## Components
- Located in src/components
- Reusable UI elements
- Keep components small and focused
- Use Composition API

## Views
- Located in src/views
- Page-level components
- Use components from src/components

## Router
- Located in src/router
- Defines navigation and routes
- Update router when adding views

## Stores
- Located in src/stores
- Pinia state management
- Shared application state

# Coding Standards
- Use Vue 3 Composition API
- Prefer <script setup>
- Use TypeScript when available
- Keep logic in composables when reusable

# Agent Behavior
- Always search project before making changes
- Prefer editing existing files
- Avoid creating duplicate components
- Maintain consistent naming

# File Types
- *.vue = UI components
- *.ts = logic and utilities
- *.js = helpers/utilities

# Important Files
Always review before major changes:
- src/main.ts
- src/App.vue
- src/router/index.ts

# When Adding Features
1. Create view in src/views
2. Add components to src/components
3. Add store if needed in src/stores
4. Update router

# Agent Workflow
1. Search project
2. Read relevant files
3. Plan changes
4. Implement changes
5. Fix imports if needed

# Searched Files
- src/**

