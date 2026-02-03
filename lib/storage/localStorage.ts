// lib/storage/localStorage.ts
// Generic localStorage wrapper with type safety

/**
 * Storage keys used across the application
 */
export const STORAGE_KEYS = {
  USERS: "nrp_crm_users",
  AUTH_SESSION: "nrp_crm_auth_session",
  CHECKLISTS: "nrp_crm_checklists",
  DOCUMENTS: "nrp_crm_documents",
  TEMP_TOKENS: "nrp_crm_temp_tokens",
  MEETING_NOTES: "nrp_crm_meeting_notes",
  REMINDERS: "nrp_crm_reminders",
  MESSAGES: "nrp_crm_messages",
  FAMILIES: "nrp_crm_families",
  SETTINGS: "nrp_crm_settings",
} as const;

/**
 * Generic get from localStorage with type safety
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Generic set to localStorage
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove from localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAppStorage(): boolean {
  if (typeof window === "undefined") return false;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error("Error clearing app storage:", error);
    return false;
  }
}

/**
 * User storage operations
 */
export const userStorage = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.USERS, [] as any[]);
  },

  save: (users: any[]) => {
    return setToStorage(STORAGE_KEYS.USERS, users);
  },

  getById: (userId: string) => {
    const users = userStorage.getAll();
    return users.find((u: any) => u.user.id === userId);
  },

  add: (user: any) => {
    const users = userStorage.getAll();
    users.push(user);
    return userStorage.save(users);
  },

  update: (userId: string, updates: any) => {
    const users = userStorage.getAll();
    const index = users.findIndex((u: any) => u.user.id === userId);

    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      return userStorage.save(users);
    }

    return false;
  },

  delete: (userId: string) => {
    const users = userStorage.getAll();
    const filtered = users.filter((u: any) => u.user.id !== userId);
    return userStorage.save(filtered);
  },
};

/**
 * Initialize storage with sample data if empty
 */
export function initializeStorageSync() {
  if (typeof window === "undefined") return;

  const users = userStorage.getAll();
  if (users.length === 0) {
    // Will be populated by sample-users.ts
    console.log("🔄 Storage initialized (empty)");
  }
}

/**
 * LocalStorageService class wrapper for backward compatibility
 */
export class LocalStorageService {
  static get<T>(key: string, defaultValue: T): T {
    return getFromStorage(key, defaultValue);
  }

  static set<T>(key: string, value: T): boolean {
    return setToStorage(key, value);
  }

  static remove(key: string): boolean {
    return removeFromStorage(key);
  }

  static clear(): boolean {
    return clearAppStorage();
  }
}
