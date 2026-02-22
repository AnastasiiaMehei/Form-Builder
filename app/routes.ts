import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  
  // Auth routes
  route("auth/register", "routes/auth.register.tsx"),
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),
  
  // Admin routes
  route("admin", "routes/admin.tsx"),
  route("admin/new", "routes/admin.new.tsx"),
  route("admin/:id", "routes/admin.$id.tsx"),
  
  // Form filling
  route("forms/:id", "routes/forms.$id.tsx"),
  
  // API routes
  ...prefix("api", [
    route("forms", "routes/api.forms.ts"),
    route("forms/:id", "routes/api.forms.$id.ts"),
  ]),
] satisfies RouteConfig;
