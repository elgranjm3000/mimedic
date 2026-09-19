const CURRENT_USER_KEY = 'medical_current_user';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return {};
  try {
    const user = JSON.parse(data);
    return user?.id ? { 'x-user-id': user.id } : {};
  } catch {
    return {};
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function apiList<T>(entity: string): Promise<T[]> {
  return request<T[]>(`/api/${entity}`);
}

export function apiGetOne<T>(entity: string, id: string): Promise<T> {
  return request<T>(`/api/${entity}/${id}`);
}

export function apiCreate<T>(entity: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
  return request<T>(`/api/${entity}`, { method: 'POST', body: JSON.stringify(data) });
}

export function apiUpdate<T>(entity: string, id: string, data: Partial<T>): Promise<T> {
  return request<T>(`/api/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function apiDelete(entity: string, id: string): Promise<boolean> {
  return request<{ success: boolean }>(`/api/${entity}/${id}`, { method: 'DELETE' }).then(() => true);
}
