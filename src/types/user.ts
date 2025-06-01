// src/types/user.ts
export interface User {
  uid: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio: string | null;
  createdAt: Date;
}
