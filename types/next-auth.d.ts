import type { DefaultSession } from 'next-auth';
import { userRoleEnum } from '@/lib/db/schema';

type UserRole = (typeof userRoleEnum.enumValues)[number];

declare module 'next-auth' {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
