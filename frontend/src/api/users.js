import { apiRequest } from './client';

export const getUsers = async ({ search = '', page = 1, limit = 50, role = 'customer' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return apiRequest(`/users?${params.toString()}`);
};

export const updateUser = async (id, { name, role, email, phone, address, nic } = {}) => {
  const body = {};
  if (typeof name === 'string') body.name = name;
  if (typeof role === 'string') body.role = role;
  if (typeof email === 'string') body.email = email;
  if (typeof phone === 'string') body.phone = phone;
  if (typeof address === 'string') body.address = address;
  if (typeof nic === 'string') body.nic = nic;
  return apiRequest(`/users/${id}`, { method: 'PUT', body });
};

export const deleteUser = async (id) => {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
};

export const createUser = async ({ name, email, role, phone, address, nic, password }) => {
  const body = { name, email, role, phone, address, nic };
  if (typeof password === 'string' && password.length > 0) body.password = password;
  return apiRequest(`/users`, { method: 'POST', body });
};

export const resetMechanicPasswordByNIC = async (nic) => {
  return apiRequest(`/users/mechanics/reset-password-nic`, { method: 'POST', body: { nic } });
};
