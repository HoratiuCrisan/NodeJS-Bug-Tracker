import { useContext } from 'react';
import { UserContext } from '../context/UserProvider';
import { can } from '../permissions/can';
import { policies } from '../permissions/policies';

export const useCan = (
  action: keyof typeof policies,
  resource?: any
): boolean => {
  const { user } = useContext(UserContext);
  if (!user) return false;
  return can(user, action, resource);
};