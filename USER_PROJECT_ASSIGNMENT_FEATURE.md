# User Project Assignment Feature - Frontend Implementation Guide

## Overview
This document describes the user project assignment feature that allows users with different roles (root, admin, user) to be associated with projects. The feature supports project-based access control and automatic group management.

## User Roles and Permissions

### Role Hierarchy
- **root**: Can view all app information, has full access to all projects
- **admin**: Related to a project, can create users with role "user" and assign them to projects
- **user**: Child of admin user, belongs to one or more projects (array support for future multi-project assignment)

### Role Permissions Summary
- **root**: 
  - Can view all projects
  - Can create users with any role
  - Can assign users to any project
  
- **admin**:
  - Can only view projects they are assigned to
  - Can only create users with role "user"
  - Must assign projects when creating users
  - Can only assign users to projects they belong to
  
- **user**:
  - Can only view projects they are assigned to
  - Cannot create other users
  - Cannot modify project assignments

## Backend Changes Summary

### Schema Updates

#### User Schema (`user.schema.ts`)
- Added `projects` field: `string[]` (array of project IDs)
- Default value: empty array `[]`

#### Project Schema (`project.schema.ts`)
- Already has `users` field: `string[]` (array of user IDs)
- This field is automatically maintained when users are created/updated

#### Group Schema (`group.schema.ts`)
- Already has `projectId` and `users` fields
- Users are automatically removed from groups when their project assignment changes

### API Endpoints

#### Create User
**Endpoint**: `POST /users`

**Request Body**:
```json
{
  "name": "John",
  "lastName": "Doe",
  "user": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "projects": ["projectId1", "projectId2"]  // Optional for root, required for admin
}
```

**Validation Rules**:
- If creator is `admin`: `projects` field is **required** and must contain at least one project ID
- If creator is `admin`: `role` must be `"user"` (admin cannot create root or admin users)
- If creator is `root`: `projects` is optional, `role` can be any value

**Response**: User object (password excluded)

**Backend Behavior**:
- When user is created with projects, each project's `users` array is automatically updated
- User's `projects` array is set to the provided project IDs

#### Update User
**Endpoint**: `PATCH /users/:id`

**Request Body**:
```json
{
  "name": "John Updated",
  "projects": ["newProjectId1", "newProjectId2"]  // Optional
}
```

**Backend Behavior**:
- If `projects` field is provided, the system:
  1. Compares old and new project assignments
  2. Adds user to new projects (updates project's `users` array)
  3. Removes user from old projects (updates project's `users` array)
  4. **Automatically removes user from groups** that belong to projects they're no longer part of

#### Get All Users
**Endpoint**: `GET /users`

**Response**: Array of user objects (password excluded, includes `projects` field)

#### Get User by ID
**Endpoint**: `GET /users/:id`

**Response**: User object (password excluded, includes `projects` field)

## Frontend Implementation Requirements

### 1. User Creation Form

#### For Admin Users
- **Required Fields**:
  - Name, Last Name, Username, Email, Password
  - Role: Fixed to "user" (read-only or hidden, default value)
  - **Projects**: Multi-select dropdown (required)
    - Only show projects that the admin belongs to
    - Must select at least one project
    - Display project titles/names

#### For Root Users
- **Required Fields**:
  - Name, Last Name, Username, Email, Password
  - Role: Dropdown with options: "root", "admin", "user"
  - **Projects**: Multi-select dropdown (optional)
    - Show all available projects
    - Can select multiple projects or none
    - Display project titles/names

#### UI Components Needed
```typescript
// Example form structure
interface CreateUserForm {
  name: string;
  lastName: string;
  user: string;
  email: string;
  password: string;
  role: 'root' | 'admin' | 'user';
  projects: string[]; // Array of project IDs
}
```

### 2. User Update Form

- **Editable Fields**:
  - Name, Last Name, Username, Email, Password (optional)
  - Role: Dropdown (only if current user is root)
  - **Projects**: Multi-select dropdown
    - Show current user's projects pre-selected
    - Allow adding/removing projects
    - For admin users: only show projects they belong to
    - For root users: show all available projects

#### Warning/Confirmation
- When projects are changed, show a warning:
  > "Changing projects will automatically remove this user from groups in projects they're no longer part of. Continue?"

### 3. User List Display

- Display user information including:
  - Basic info (name, email, role)
  - **Projects**: Show list of project names (not just IDs)
    - Format: "Project 1, Project 2, Project 3"
    - Or use badges/chips for each project
  - Actions: Edit, Delete (based on permissions)

### 4. Project Selection Component

#### Requirements
- Multi-select dropdown/combobox
- Search/filter functionality for large project lists
- Display project title/name
- Show selected projects as chips/badges
- For admin: Filter to only show projects they belong to
- For root: Show all projects

#### Example Implementation
```typescript
// Project selector component
interface ProjectSelectorProps {
  selectedProjects: string[];
  onChange: (projectIds: string[]) => void;
  availableProjects: Project[]; // Filtered based on user role
  required?: boolean;
  disabled?: boolean;
}
```

### 5. API Integration

#### Create User Service
```typescript
async createUser(userData: CreateUserForm): Promise<User> {
  const response = await fetch('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}
```

#### Update User Service
```typescript
async updateUser(userId: string, userData: Partial<CreateUserForm>): Promise<User> {
  const response = await fetch(`/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}
```

### 6. Error Handling

#### Common Error Scenarios
1. **Admin creating user without projects**:
   - Error: "Projects must be provided when admin creates a user"
   - Show validation error on projects field

2. **Admin trying to create root/admin user**:
   - Error: "Admin can only create users with role 'user'"
   - Disable or hide role selector for admin

3. **Invalid project ID**:
   - Error: "Project with id {projectId} not found"
   - Validate project IDs before submission

4. **User already exists**:
   - Error: "User or email already exists"
   - Show field-specific error messages

### 7. Data Fetching

#### Get Available Projects
- Before showing user creation/update form, fetch available projects:
  - **Admin**: `GET /projects` (returns only projects admin belongs to)
  - **Root**: `GET /projects` (returns all projects)

#### Get User Details
- When editing user, fetch user details including `projects` array
- Map project IDs to project names for display

### 8. State Management

#### Recommended State Structure
```typescript
interface UserState {
  users: User[];
  currentUser: User | null;
  availableProjects: Project[];
  loading: boolean;
  error: string | null;
}

interface User {
  _id: string;
  name: string;
  lastName: string;
  user: string;
  email: string;
  role: 'root' | 'admin' | 'user';
  projects: string[]; // Array of project IDs
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 9. UI/UX Recommendations

1. **Project Selection**:
   - Use a multi-select component with search
   - Show selected projects as removable chips
   - Display project count: "3 projects selected"
   - For admin: Show only their projects with a note: "You can only assign users to your projects"

2. **Form Validation**:
   - Real-time validation
   - Show required field indicators
   - Disable submit until all required fields are valid
   - Show helpful error messages

3. **Confirmation Dialogs**:
   - When updating projects: Warn about group removal
   - When deleting user: Confirm action

4. **Loading States**:
   - Show loading spinner during API calls
   - Disable form during submission
   - Show success/error notifications

5. **Feedback**:
   - Show success message after user creation/update
   - Show error messages for failed operations
   - Use toast notifications or inline messages

### 10. Testing Scenarios

#### Test Cases to Implement
1. **Admin creates user**:
   - ✅ Must select at least one project
   - ✅ Cannot set role to root/admin
   - ✅ User is created and added to selected projects

2. **Root creates user**:
   - ✅ Can select any role
   - ✅ Projects are optional
   - ✅ User is created successfully

3. **Update user projects**:
   - ✅ User is removed from old projects
   - ✅ User is added to new projects
   - ✅ User is removed from groups in old projects

4. **Validation**:
   - ✅ Cannot create user without required fields
   - ✅ Email must be valid format
   - ✅ Password must meet minimum requirements
   - ✅ Project IDs must be valid

## Example API Response

### User Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John",
  "lastName": "Doe",
  "user": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "projects": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "removed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Project Object (for reference)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Project Alpha",
  "config": {},
  "devices": [],
  "users": ["507f1f77bcf86cd799439011"],
  "deleted": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Migration Notes

- Existing users will have an empty `projects` array by default
- Frontend should handle cases where `projects` is undefined or empty
- When displaying users, show "No projects assigned" if projects array is empty
- Consider adding a migration script or UI to assign existing users to projects

## Additional Considerations

1. **Performance**:
   - Cache project list to avoid repeated API calls
   - Use pagination for large user lists
   - Lazy load project details when needed

2. **Accessibility**:
   - Ensure form fields are properly labeled
   - Support keyboard navigation
   - Provide ARIA labels for screen readers

3. **Internationalization**:
   - Translate all UI text
   - Format dates according to locale
   - Support RTL languages if needed

4. **Security**:
   - Never expose passwords in API responses (already handled by backend)
   - Validate all inputs on frontend before submission
   - Implement proper authentication token handling

## Summary

The frontend needs to:
1. ✅ Add project selection to user creation form (required for admin, optional for root)
2. ✅ Add project selection to user update form
3. ✅ Display user's projects in user list and detail views
4. ✅ Handle role-based permissions (admin can only create users, must assign projects)
5. ✅ Show warnings when projects are changed (group removal)
6. ✅ Fetch and display available projects based on user role
7. ✅ Implement proper validation and error handling
8. ✅ Update UI to show project information throughout the application
