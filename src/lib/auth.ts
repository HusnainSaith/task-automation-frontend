export interface User {
  id: string;
  email: string;
  role: 'owner' | 'serviceman' | 'client';
  companyId: string;
}

export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const setToken = (token: string) => typeof window !== 'undefined' && localStorage.setItem('token', token);
export const removeToken = () => typeof window !== 'undefined' && localStorage.removeItem('token');

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user: User) => typeof window !== 'undefined' && localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => typeof window !== 'undefined' && localStorage.removeItem('user');

export const logout = () => {
  removeToken();
  removeUser();
};