import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/chats.tsx"),
  route("login", "routes/login.tsx"),
  route("chats/:id", "routes/chatsid.tsx"),
] satisfies RouteConfig;
