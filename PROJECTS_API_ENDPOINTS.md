# Projects API Endpoints Documentation

This document provides comprehensive documentation for all Projects API endpoints to be used in frontend implementation.

## Base URL
```
/api/projects
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new project |
| GET | `/` | Get all projects |
| GET | `/:id` | Get project by ID |
| PATCH | `/:id` | Update project |
| PATCH | `/:id/devices` | Update project devices |
| DELETE | `/:id` | Delete project |

---

## 1. Create Project

**Endpoint:** `POST /api/projects`

**Description:** Creates a new project with the provided details.

**Request Body:**
```typescript
{
  title: string;           // Required - Project title
  config?: any;           // Optional - Project configuration object
  devices?: string[];     // Optional - Array of device IDs
}
```

**Example Request:**
```json
{
  "title": "My New Project",
  "config": {
    "recordingSettings": {
      "quality": "high",
      "format": "mp3"
    }
  },
  "devices": ["device1", "device2"]
}
```

**Response:**
```typescript
{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Get All Projects

**Endpoint:** `GET /api/projects`

**Description:** Retrieves all projects.

**Query Parameters:** None

**Response:**
```typescript
Array<{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}>
```

---

## 3. Get Project by ID

**Endpoint:** `GET /api/projects/:id`

**Description:** Retrieves a specific project by its ID.

**Path Parameters:**
- `id` (string): The unique identifier of the project

**Response:**
```typescript
{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `404 Not Found`: Project not found

---

## 4. Update Project

**Endpoint:** `PATCH /api/projects/:id`

**Description:** Updates an existing project with new data.

**Path Parameters:**
- `id` (string): The unique identifier of the project

**Request Body:**
```typescript
{
  title?: string;         // Optional - Project title
  config?: any;          // Optional - Project configuration object
  devices?: string[];    // Optional - Array of device IDs
}
```

**Example Request:**
```json
{
  "title": "Updated Project Title",
  "config": {
    "recordingSettings": {
      "quality": "medium",
      "format": "wav"
    }
  }
}
```

**Response:**
```typescript
{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `404 Not Found`: Project not found

---

## 5. Update Project Devices

**Endpoint:** `PATCH /api/projects/:id/devices`

**Description:** Updates the devices associated with a project.

**Path Parameters:**
- `id` (string): The unique identifier of the project

**Request Body:**
```typescript
{
  devices: string[];     // Required - Array of device IDs
}
```

**Example Request:**
```json
{
  "devices": ["device1", "device3", "device5"]
}
```

**Response:**
```typescript
{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `404 Not Found`: Project not found

---

## 6. Delete Project

**Endpoint:** `DELETE /api/projects/:id`

**Description:** Soft deletes a project (sets deleted flag to true).

**Path Parameters:**
- `id` (string): The unique identifier of the project

**Response:**
```typescript
{
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `404 Not Found`: Project not found

---

## Frontend Implementation Examples

### JavaScript/TypeScript with Fetch API

```typescript
// Base URL configuration
const API_BASE_URL = 'http://localhost:3000/api/projects';

// Create Project
async function createProject(projectData: CreateProjectDto) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  return response.json();
}

// Get All Projects
async function getAllProjects() {
  const response = await fetch(API_BASE_URL);
  return response.json();
}

// Get Project by ID
async function getProjectById(id: string) {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return response.json();
}

// Update Project
async function updateProject(id: string, updateData: UpdateProjectDto) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return response.json();
}

// Update Project Devices
async function updateProjectDevices(id: string, devices: string[]) {
  const response = await fetch(`${API_BASE_URL}/${id}/devices`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ devices }),
  });
  return response.json();
}

// Delete Project
async function deleteProject(id: string) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface Project {
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: CreateProjectDto) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      const newProject = await response.json();
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError('Failed to create project');
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    fetchProjects,
  };
}
```

---

## Error Handling

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request body or validation errors
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error response format:
```json
{
  "statusCode": number,
  "message": string,
  "error": string
}
```

---

## Notes

1. All timestamps are in ISO 8601 format
2. The `deleted` field is used for soft deletion - deleted projects are not physically removed
3. Device IDs should reference existing devices in the system
4. The `config` field is flexible and can store any JSON object
5. All endpoints return the complete project object after successful operations
