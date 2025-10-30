const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photoUrl: string;
  photos?: string[];
  province?: string | null;
  city?: string | null;
}

export interface Match {
  id: string;
  matchedUser: User;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SwipeResponse {
  success: boolean;
  match: boolean;
  matchId?: string;
}

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('forkeep_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('forkeep_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('forkeep_token');
};

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await authFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      return data;
    },

    signup: async (userData: {
      email: string;
      password: string;
      name: string;
      age: number;
      gender: string;
      lookingFor: string;
      bio: string;
      photoUrl: string;
      province?: string;
      city?: string;
      photos?: string[];
    }) => {
      const data = await authFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setAuthToken(data.token);
      return data;
    },

    logout: () => {
      clearAuthToken();
    },
  },

  users: {
    discover: async (
      cursor?: string,
      limit = 10
    ): Promise<{
      users: User[];
      nextCursor: string | null;
      hasMore: boolean;
    }> => {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', limit.toString());

      const queryString = params.toString();
      return authFetch(
        `/api/users/discover${queryString ? `?${queryString}` : ''}`
      );
    },
  },

  swipes: {
    create: async (
      swipedUserId: string,
      direction: 'left' | 'right'
    ): Promise<SwipeResponse> => {
      return authFetch('/api/swipes', {
        method: 'POST',
        body: JSON.stringify({ swipedUserId, direction }),
      });
    },
  },

  matches: {
    list: async (): Promise<{ matches: Match[] }> => {
      return authFetch('/api/matches');
    },

    unviewed: async (): Promise<{ matches: Match[] }> => {
      return authFetch('/api/matches/unviewed');
    },

    markAsViewed: async (matchId: string): Promise<{ success: boolean }> => {
      return authFetch(`/api/matches/${matchId}/view`, {
        method: 'POST',
      });
    },

    delete: async (matchId: string): Promise<{ success: boolean }> => {
      return authFetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });
    },
  },

  messages: {
    send: async (
      matchId: string,
      content: string
    ): Promise<{ message: Message }> => {
      return authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ matchId, content }),
      });
    },

    getByMatch: async (matchId: string): Promise<{ messages: Message[] }> => {
      return authFetch(`/api/messages/${matchId}`);
    },
  },

  profile: {
    getMe: async () => {
      return authFetch('/api/profile/me');
    },

    updateMe: async (updates: Partial<User>) => {
      return authFetch('/api/profile/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getById: async (userId: string) => {
      return authFetch(`/api/profile/${userId}`);
    },
  },
};
