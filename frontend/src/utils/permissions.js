// Mirrors backend/roles.py. The server enforces these rules; the UI only hides
// controls people are not allowed to use.
export const OPERATIONS_EDITORS = ["Admin", "Planner", "Supervisor"];

export const canEditOperations = (role) => OPERATIONS_EDITORS.includes(role);
