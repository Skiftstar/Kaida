import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/chats.tsx'),
  route('login', 'routes/login.tsx'),
  route('chats/:id', 'routes/chatsid.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('meds', 'routes/meds.tsx'),
  route('sessions', 'routes/sessions.tsx')
] satisfies RouteConfig
