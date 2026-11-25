"""Who may do what. Reading is open to any signed-in user (the dashboard and
reports need data from several areas); these lists control who may CHANGE data."""

ADMIN = "Admin"
PLANNER = "Planner"
SUPERVISOR = "Supervisor"
MANAGEMENT = "Management"

ALL_ROLES = (ADMIN, PLANNER, SUPERVISOR, MANAGEMENT)

# Products, inventory, work orders
MASTER_DATA_EDITORS = (ADMIN, PLANNER)

# Production runs and issues (the people on the shop floor)
OPERATIONS_EDITORS = (ADMIN, PLANNER, SUPERVISOR)

# Users and settings
ADMINS_ONLY = (ADMIN,)
