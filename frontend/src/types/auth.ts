export interface UserDto { 
  email?: string; 
  role?: string; 
  roles?: string[]; 
}

export const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export function isAdminOrHR(role?: string): boolean { 
  if (!role) return false; 
  const normalized = role.toLowerCase(); 
  
  // 3. Cast to string to safely compare with your array elements
  return [UserRole.ADMIN, UserRole.HR, '1', '2'].includes(normalized as string); 
}
