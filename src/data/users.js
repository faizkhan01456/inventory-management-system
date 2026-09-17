import { demoUsers, superAdmin } from "./demoData";

export const DEFAULT_USERS = [
  ...demoUsers,
];

export const SUPER_ADMIN = superAdmin;

export const getDefaultUsers = () => {
  return [...DEFAULT_USERS];
};