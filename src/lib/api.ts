const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
  // Auth
  register: (data: { email: string; password: string; companyName: string }) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  login: (data: { email: string; password: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  // Users
  createClient: (data: { email: string; password: string; name?: string; phone?: string }, token: string) =>
    fetch(`${API_BASE}/users/clients`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  createServiceman: (data: { email: string; password: string; name?: string; phone?: string; skills?: string[] }, token: string) =>
    fetch(`${API_BASE}/users/servicemen`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  setServicemanLocation: (address: string, token: string) =>
    fetch(`${API_BASE}/users/servicemen/my-location`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ address }),
    }).then(res => res.json()),

  setClientLocation: (clientId: string, address: string, token: string) =>
    fetch(`${API_BASE}/users/clients/${clientId}/location`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ address }),
    }).then(res => res.json()),

  toggleServicemanStatus: (servicemanId: string, isOnline: boolean, token: string) =>
    fetch(`${API_BASE}/users/servicemen/${servicemanId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isOnline }),
    }).then(res => res.json()),

  // Problems
  reportProblem: (data: { title: string; description: string; address: string }, token: string) =>
    fetch(`${API_BASE}/problems/report`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  // Tasks
  createTask: (data: { title: string; description: string; clientId: string; address: string }, token: string) =>
    fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  updateTaskStatus: (taskId: string, status: string, token: string) =>
    fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    }).then(res => res.json()),

  completeTask: (taskId: string, token: string) =>
    fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getTasks: (token: string, status?: string) =>
    fetch(`${API_BASE}/tasks${status ? `?status=${status}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getServicemanProfile: (token: string) =>
    fetch(`${API_BASE}/users/servicemen/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getServicemen: (token: string) =>
    fetch(`${API_BASE}/users/servicemen`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getClients: (token: string) =>
    fetch(`${API_BASE}/users/clients`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getAllTasks: (token: string) =>
    fetch(`${API_BASE}/tasks/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),
};