const BASE = '/api';
const getToken = () => localStorage.getItem('ethara_token');

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new Error('Cannot connect to server. Make sure the backend is running on port 5000.');
  }

  // Try to parse JSON — if backend returns HTML (e.g. error page), handle gracefully
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(`Server error (${res.status}). Is the backend running?`);
    throw new Error(`Unexpected response: ${text.slice(0, 100)}`);
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup:        (b)    => req('POST',   '/auth/signup', b),
  login:         (b)    => req('POST',   '/auth/login',  b),
  me:            ()     => req('GET',    '/auth/me'),
  getProjects:   ()     => req('GET',    '/projects'),
  createProject: (b)    => req('POST',   '/projects', b),
  updateProject: (id,b) => req('PUT',    `/projects/${id}`, b),
  deleteProject: (id)   => req('DELETE', `/projects/${id}`),
  getDashboard:  ()     => req('GET',    '/tasks/dashboard'),
  getTasks:      ()     => req('GET',    '/tasks'),
  createTask:    (b)    => req('POST',   '/tasks', b),
  updateStatus:  (id,s) => req('PATCH',  `/tasks/${id}/status`, { status: s }),
  deleteTask:    (id)   => req('DELETE', `/tasks/${id}`),
  getTeam:       ()     => req('GET',    '/team'),
  addMember:     (b)    => req('POST',   '/team', b),
  removeMember:  (id)   => req('DELETE', `/team/${id}`),
};
