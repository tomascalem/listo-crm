const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Token storage
const TOKEN_KEY = 'listo_access_token';
const REFRESH_TOKEN_KEY = 'listo_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Transform underscore enum values to hyphenated (API -> Frontend)
function transformVenue(venue: any): any {
  if (!venue) return venue;
  return {
    ...venue,
    stage: venue.stage?.replace(/_/g, '-'),
    type: venue.type?.replace(/_/g, '-'),
    // Transform nested assignedUsers to assignedUserIds for compatibility
    assignedUserIds: venue.assignedUsers?.map((u: any) => u.id) || [],
  };
}

function transformVenues(venues: any[]): any[] {
  return venues.map(transformVenue);
}

// Transform hyphenated enum values to underscores (Frontend -> API)
function transformStageToApi(stage: string): string {
  return stage?.replace(/-/g, '_');
}

function transformTypeToApi(type: string): string {
  return type?.replace(/-/g, '_');
}

// Fetch wrapper with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      const newToken = getAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const retryData = await retryResponse.json();
      if (!retryResponse.ok) {
        throw new ApiError(retryData.error?.message || 'Request failed', retryResponse.status);
      }
      return retryData.data;
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(data.error?.message || 'Request failed', response.status);
  }

  return data.data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Custom error class
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(data.error?.message || 'Login failed', response.status);
    }

    setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.user;
  },

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(data.error?.message || 'Registration failed', response.status);
    }

    setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.user;
  },

  async logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser() {
    return apiFetch<{
      id: string;
      email: string;
      name: string;
      avatar: string;
      avatarUrl?: string;
    }>('/auth/me');
  },
};

// Venues API
export const venuesApi = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    stage?: string;
    type?: string;
    operatorId?: string;
    assignedTo?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          // Transform stage/type to API format (underscores)
          if (key === 'stage') {
            searchParams.set(key, transformStageToApi(String(value)));
          } else if (key === 'type') {
            searchParams.set(key, transformTypeToApi(String(value)));
          } else {
            searchParams.set(key, String(value));
          }
        }
      });
    }
    const query = searchParams.toString();
    const response = await apiFetch<PaginatedResponse<any>>(`/venues${query ? `?${query}` : ''}`);
    return {
      ...response,
      items: transformVenues(response.items),
    };
  },

  async getById(id: string) {
    const venue = await apiFetch<any>(`/venues/${id}`);
    return transformVenue(venue);
  },

  async create(data: any) {
    const apiData = {
      ...data,
      stage: data.stage ? transformStageToApi(data.stage) : undefined,
      type: data.type ? transformTypeToApi(data.type) : undefined,
    };
    const venue = await apiFetch<any>('/venues', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    return transformVenue(venue);
  },

  async update(id: string, data: any) {
    const apiData = {
      ...data,
      stage: data.stage ? transformStageToApi(data.stage) : undefined,
      type: data.type ? transformTypeToApi(data.type) : undefined,
    };
    const venue = await apiFetch<any>(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
    return transformVenue(venue);
  },

  async updateStage(id: string, stage: string) {
    const venue = await apiFetch<any>(`/venues/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: transformStageToApi(stage) }),
    });
    return transformVenue(venue);
  },

  async delete(id: string) {
    return apiFetch<any>(`/venues/${id}`, { method: 'DELETE' });
  },

  async getContacts(id: string) {
    return apiFetch<any>(`/venues/${id}/contacts`);
  },

  async getInteractions(id: string) {
    return apiFetch<any>(`/venues/${id}/interactions`);
  },

  async getTodos(id: string) {
    return apiFetch<any>(`/venues/${id}/todos`);
  },
};

// Contacts API
export const contactsApi = {
  async list(params?: { page?: number; limit?: number; venueId?: string; operatorId?: string; concessionaireId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/contacts${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/contacts/${id}`);
  },

  async create(data: any) {
    return apiFetch<any>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/contacts/${id}`, { method: 'DELETE' });
  },
};

// Operators API
export const operatorsApi = {
  async list(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/operators${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/operators/${id}`);
  },

  async getVenues(id: string) {
    const venues = await apiFetch<any>(`/operators/${id}/venues`);
    return Array.isArray(venues) ? transformVenues(venues) : venues;
  },

  async getContacts(id: string) {
    return apiFetch<any>(`/operators/${id}/contacts`);
  },

  async getInteractions(id: string) {
    return apiFetch<any>(`/operators/${id}/interactions`);
  },

  async create(data: any) {
    return apiFetch<any>('/operators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/operators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/operators/${id}`, { method: 'DELETE' });
  },
};

// Concessionaires API
export const concessionairesApi = {
  async list(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/concessionaires${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/concessionaires/${id}`);
  },

  async getVenues(id: string) {
    const venues = await apiFetch<any>(`/concessionaires/${id}/venues`);
    return Array.isArray(venues) ? transformVenues(venues) : venues;
  },

  async getContacts(id: string) {
    return apiFetch<any>(`/concessionaires/${id}/contacts`);
  },

  async create(data: any) {
    return apiFetch<any>('/concessionaires', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/concessionaires/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/concessionaires/${id}`, { method: 'DELETE' });
  },
};

// Todos API
export const todosApi = {
  async list(params?: { assignedTo?: string; venueId?: string; completed?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/todos${query ? `?${query}` : ''}`);
  },

  async create(data: any) {
    return apiFetch<any>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleComplete(id: string, completed: boolean) {
    return apiFetch<any>(`/todos/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/todos/${id}`, { method: 'DELETE' });
  },
};

// Interactions API
export const interactionsApi = {
  async list(params?: { venueId?: string; contactId?: string; userId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/interactions${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/interactions/${id}`);
  },

  async create(data: any) {
    return apiFetch<any>('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/interactions/${id}`, { method: 'DELETE' });
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats() {
    return apiFetch<any>('/dashboard/stats');
  },

  async getTodos(limit = 10) {
    return apiFetch<{ items: any[]; total: number }>(`/dashboard/todos?limit=${limit}`);
  },

  async getSchedule(date?: string) {
    const query = date ? `?date=${date}` : '';
    return apiFetch<{ items: any[]; total: number }>(`/dashboard/schedule${query}`);
  },

  async getRecommendedActions() {
    return apiFetch<{ items: any[]; total: number }>('/dashboard/recommended-actions');
  },

  async dismissRecommendedAction(id: string) {
    return apiFetch<any>(`/dashboard/recommended-actions/${id}/dismiss`, {
      method: 'PATCH',
    });
  },

  async completeRecommendedAction(id: string) {
    return apiFetch<any>(`/dashboard/recommended-actions/${id}/complete`, {
      method: 'PATCH',
    });
  },

  async getInsights(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return apiFetch<{ items: any[]; total: number }>(`/dashboard/insights${query}`);
  },

  async markInsightRead(id: string) {
    return apiFetch<any>(`/dashboard/insights/${id}/read`, {
      method: 'PATCH',
    });
  },
};

// Analytics API
export const analyticsApi = {
  async getPipelineMetrics() {
    return apiFetch<any>('/analytics/pipeline');
  },

  async getRevenueMetrics() {
    return apiFetch<any>('/analytics/revenue');
  },

  async getActivityMetrics() {
    return apiFetch<any>('/analytics/activity');
  },

  async getPerformanceMetrics() {
    return apiFetch<any>('/analytics/performance');
  },
};

// Search API
export const searchApi = {
  async globalSearch(query: string) {
    return apiFetch<any>(`/search?q=${encodeURIComponent(query)}`);
  },
};

// Users API
export const usersApi = {
  async list() {
    // Users endpoint returns array directly (not paginated)
    return apiFetch<any[]>('/users');
  },

  async getById(id: string) {
    return apiFetch<any>(`/users/${id}`);
  },
};

// Files API
export const filesApi = {
  async list(params?: { entityType?: string; entityId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/files${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/files/${id}`);
  },

  async create(data: any) {
    return apiFetch<any>('/files', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/files/${id}`, { method: 'DELETE' });
  },

  async getDownloadUrl(id: string) {
    return apiFetch<{ url: string }>(`/files/${id}/download`);
  },

  async getUploadUrl(data: { fileName: string; mimeType: string; entityType: string; entityId: string }) {
    return apiFetch<{ uploadUrl: string; s3Key: string }>('/files/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Contracts API
export const contractsApi = {
  async list(params?: { entityType?: string; entityId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/contracts${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/contracts/${id}`);
  },

  async create(data: any) {
    return apiFetch<any>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/contracts/${id}`, { method: 'DELETE' });
  },

  async getDownloadUrl(id: string) {
    return apiFetch<{ url: string }>(`/contracts/${id}/download`);
  },
};

// Events API
export const eventsApi = {
  async list(params?: { userId?: string; date?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<any>>(`/events${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiFetch<any>(`/events/${id}`);
  },

  async create(data: any) {
    return apiFetch<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/events/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// Google Integration API
// ============================================

export interface GoogleConnectionStatus {
  connected: boolean;
  email: string | null;
  lastGmailSync: string | null;
  lastCalendarSync: string | null;
  connectedAt: string | null;
  syncStatus: {
    gmailSyncStatus: 'idle' | 'syncing' | 'error';
    calendarSyncStatus: 'idle' | 'syncing' | 'error';
    lastGmailError: string | null;
    lastCalendarError: string | null;
  } | null;
}

export interface CalendarSyncResult {
  synced: boolean;
  imported: number;
  updated: number;
  deleted: number;
}

export const googleApi = {
  async getAuthUrl() {
    return apiFetch<{ authUrl: string }>('/google/auth-url');
  },

  async disconnect() {
    return apiFetch<{ disconnected: boolean }>('/google/disconnect', {
      method: 'POST',
    });
  },

  async getConnectionStatus() {
    return apiFetch<GoogleConnectionStatus>('/google/status');
  },

  async syncCalendar(fullSync = false) {
    return apiFetch<CalendarSyncResult>('/google/calendar/sync', {
      method: 'POST',
      body: JSON.stringify({ fullSync }),
    });
  },
};
