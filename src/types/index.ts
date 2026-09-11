import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    role: string
  }
}

// Ensure JWT typing works
import 'next-auth/jwt'
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var mongoose: any;
}
export {};
