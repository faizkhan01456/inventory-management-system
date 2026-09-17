export const STORAGE_KEYS = {
    AUTH: "inventory_auth",
    USERS: "inventory_users",
    BUSINESSES: "inventory_businesses",
    PRODUCTS: "inventory_products",
    CATEGORIES: "inventory_categories",
    CUSTOMERS: "inventory_customers",
    SUPPLIERS: "inventory_suppliers",
    SALES: "inventory_sales",
    PURCHASES: "inventory_purchases",
    STAFF: "inventory_staff",
    NOTIFICATIONS: "inventory_notifications",
    SETTINGS: "inventory_settings",
    PLANS: "inventory_plans",
    SUBSCRIPTIONS: "inventory_subscriptions",
};

/* Get data */
export function getStorage(key, fallback = null) {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(
            `Error reading localStorage "${key}":`,
            error
        );

        return fallback;
    }
}

/* Save data */
export function setStorage(key, value) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch (error) {
        console.error(
            `Error saving localStorage "${key}":`,
            error
        );
    }
}

/* Remove data */
export function removeStorage(key) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(
            `Error removing localStorage "${key}":`,
            error
        );
    }
}

/* Clear application storage */
export function clearStorage() {
    if (typeof window === "undefined") {
        return;
    }

    try {
        Object.values(STORAGE_KEYS).forEach(
            (key) => {
                localStorage.removeItem(key);
            }
        );
    } catch (error) {
        console.error(
            "Error clearing application storage:",
            error
        );
    }
}