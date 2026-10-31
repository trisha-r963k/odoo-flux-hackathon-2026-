import { Role } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      customerProfileId?: string | null;
      companyName?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
    customerProfileId?: string | null;
    companyName?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    role: Role;
    customerProfileId?: string | null;
    companyName?: string | null;
  }
}
