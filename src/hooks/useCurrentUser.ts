import { getCurrentUserId } from '../utils/auth';

export const useCurrentUser = () => {
  const userId = getCurrentUserId();
  return { userId };
};
