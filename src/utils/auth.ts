export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('forkeep_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('forkeep_token');
};

export const clearAuth = (): void => {
  localStorage.removeItem('forkeep_token');
};
