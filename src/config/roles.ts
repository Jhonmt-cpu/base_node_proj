const roles = {
  admin: "Admin",
  user: "User",
};

const rolesGroups = {
  admin: [roles.admin],
  user: [roles.user],
  adminAndUser: [roles.admin, roles.user],
};

export { roles, rolesGroups };
