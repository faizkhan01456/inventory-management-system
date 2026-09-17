import {
    getStorage,
    setStorage,
    removeStorage,
    STORAGE_KEYS,
} from "./storage";

import {
    demoUsers,
    superAdmin,
} from "@/data/demoData";

const ADMIN_PROFILE_KEY = "inventory_admin_profile";

export function initializeDemoUsers() {
    const existingUsers = getStorage(
        STORAGE_KEYS.USERS,
        null
    );

    if (!Array.isArray(existingUsers)) {
        setStorage(
            STORAGE_KEYS.USERS,
            demoUsers
        );
    }
}

export function getUsers() {
    const users = getStorage(
        STORAGE_KEYS.USERS,
        null
    );

    if (!Array.isArray(users)) {
        initializeDemoUsers();

        return getStorage(
            STORAGE_KEYS.USERS,
            demoUsers
        );
    }

    return users;
}

export function saveUsers(users) {
    setStorage(
        STORAGE_KEYS.USERS,
        Array.isArray(users) ? users : []
    );
}

export function findUserByUsername(username) {
    if (!username) return null;

    const normalizedUsername =
        String(username)
            .trim()
            .toLowerCase();

    const users = getUsers();

    return users.find(
        (user) =>
            String(user.username || "")
                .trim()
                .toLowerCase() ===
            normalizedUsername
    ) || null;
}

function getSuperAdminProfile() {
    const savedProfile = getStorage(
        ADMIN_PROFILE_KEY,
        null
    );

    if (!savedProfile) {
        return {
            ...superAdmin,
        };
    }

    return {
        ...superAdmin,
        ...savedProfile,
    };
}

export function authenticate(username, password) {
    if (!username || !password) {
        return {
            success: false,
            message: "Username and password are required.",
        };
    }

    const normalizedUsername =
        String(username)
            .trim()
            .toLowerCase();

    /*
     * Super Admin
     */
    const adminProfile =
        getSuperAdminProfile();

    if (
        normalizedUsername ===
            String(
                adminProfile.username || "superadmin"
            )
                .trim()
                .toLowerCase() &&
        String(adminProfile.password) ===
            String(password)
    ) {
        return {
            success: true,
            user: {
                ...adminProfile,
                role: "SUPER_ADMIN",
                status: "ACTIVE",
                isSuperAdmin: true,
            },
        };
    }

    /*
     * Normal User
     */
    const user = findUserByUsername(
        username
    );

    if (!user) {
        return {
            success: false,
            message: "Invalid username or password.",
        };
    }

    if (
        String(user.password) !==
        String(password)
    ) {
        return {
            success: false,
            message: "Invalid username or password.",
        };
    }

    if (
        String(user.status || "ACTIVE")
            .toUpperCase() !== "ACTIVE"
    ) {
        return {
            success: false,
            message: "Your account is deactivated.",
        };
    }

    /*
     * Don't expose password in auth session.
     */
    const authenticatedUser = {
        ...user,
    };

    delete authenticatedUser.password;

    return {
        success: true,
        user: authenticatedUser,
    };
}

export function login(username, password) {
    const result = authenticate(
        username,
        password
    );

    if (!result.success) {
        return result;
    }

    setStorage(
        STORAGE_KEYS.AUTH,
        result.user
    );

    return result;
}

export function getCurrentUser() {
    return getStorage(
        STORAGE_KEYS.AUTH,
        null
    );
}

export function logout() {
    removeStorage(
        STORAGE_KEYS.AUTH
    );
}

export function isAuthenticated() {
    return !!getCurrentUser();
}

export function isSuperAdmin() {
    const user = getCurrentUser();

    return (
        user?.isSuperAdmin === true ||
        user?.role === "SUPER_ADMIN"
    );
}

export function isBusinessUser() {
    const user = getCurrentUser();

    return (
        user &&
        !isSuperAdmin() &&
        (
            user.role === "USER" ||
            user.role === "BUSINESS_USER"
        )
    );
}