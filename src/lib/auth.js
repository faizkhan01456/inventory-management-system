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

/*
|--------------------------------------------------------------------------
| Initialize Users
|--------------------------------------------------------------------------
*/

export function initializeDemoUsers() {
    const existingUsers =
        getStorage(
            STORAGE_KEYS.USERS,
            null
        );

    /*
     * Existing localStorage users ko
     * overwrite nahi karna.
     */

    if (
        Array.isArray(
            existingUsers
        )
    ) {
        return existingUsers;
    }

    setStorage(
        STORAGE_KEYS.USERS,
        demoUsers
    );

    return demoUsers;
}

/*
|--------------------------------------------------------------------------
| Get Users
|--------------------------------------------------------------------------
*/

export function getUsers() {
    const storedUsers =
        getStorage(
            STORAGE_KEYS.USERS,
            null
        );

    if (
        Array.isArray(
            storedUsers
        )
    ) {
        return storedUsers;
    }

    setStorage(
        STORAGE_KEYS.USERS,
        demoUsers
    );

    return demoUsers;
}

/*
|--------------------------------------------------------------------------
| Find User
|--------------------------------------------------------------------------
*/

export function findUserByUsername(
    username
) {
    if (!username) {
        return null;
    }

    const users =
        getUsers();

    const normalizedUsername =
        username
            .trim()
            .toLowerCase();

    return (
        users.find(
            (user) =>
                user.username
                    ?.trim()
                    .toLowerCase() ===
                normalizedUsername
        ) || null
    );
}

/*
|--------------------------------------------------------------------------
| Authenticate
|--------------------------------------------------------------------------
*/

export function authenticate(
    username,
    password
) {
    if (
        !username ||
        !password
    ) {
        return {
            success: false,
            message:
                "Username and password are required.",
        };
    }

    const cleanUsername =
        username.trim();

    /*
     * SUPER ADMIN
     */

    const superAdminUsername =
        String(
            superAdmin?.username ||
                "superadmin"
        )
            .trim()
            .toLowerCase();

    const superAdminPassword =
        String(
            superAdmin?.password ||
                "Admin@123"
        );

    if (
        cleanUsername
            .toLowerCase() ===
            superAdminUsername &&
        String(password) ===
            superAdminPassword
    ) {
        const adminUser = {
            id:
                superAdmin?.id ||
                "super_admin",

            name:
                superAdmin?.name ||
                "Super Admin",

            username:
                superAdmin?.username ||
                "superadmin",

            email:
                superAdmin?.email ||
                "",

            role: "SUPER_ADMIN",

            status: "ACTIVE",
        };

        return {
            success: true,
            user: adminUser,
        };
    }

    /*
     * NORMAL BUSINESS USER
     */

    const user =
        findUserByUsername(
            cleanUsername
        );

    if (!user) {
        return {
            success: false,
            message:
                "Invalid username or password.",
        };
    }

    /*
     * PASSWORD
     */

    if (
        String(user.password) !==
        String(password)
    ) {
        return {
            success: false,
            message:
                "Invalid username or password.",
        };
    }

    /*
     * STATUS
     *
     * Only ACTIVE users can login.
     */

    const status =
        String(
            user.status ||
                "ACTIVE"
        ).toUpperCase();

    if (
        status !==
        "ACTIVE"
    ) {
        return {
            success: false,
            message:
                "Your account has been deactivated. Please contact administrator.",
        };
    }

    /*
     * Don't store password in
     * authenticated session.
     */

    const authenticatedUser = {
        id: user.id,

        name: user.name,

        username: user.username,

        businessName:
            user.businessName ||
            "",

        email:
            user.email || "",

        phone:
            user.phone || "",

        plan:
            user.plan ||
            "BASIC",

        role:
            user.role ||
            "USER",

        status:
            user.status ||
            "ACTIVE",

        createdAt:
            user.createdAt ||
            "",
    };

    return {
        success: true,
        user: authenticatedUser,
    };
}

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export function login(
    username,
    password
) {
    const result =
        authenticate(
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

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export function getCurrentUser() {
    return getStorage(
        STORAGE_KEYS.AUTH,
        null
    );
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export function logout() {
    removeStorage(
        STORAGE_KEYS.AUTH
    );
}

/*
|--------------------------------------------------------------------------
| Is Authenticated
|--------------------------------------------------------------------------
*/

export function isAuthenticated() {
    return Boolean(
        getCurrentUser()
    );
}

/*
|--------------------------------------------------------------------------
| Super Admin Check
|--------------------------------------------------------------------------
*/

export function isSuperAdmin() {
    const user =
        getCurrentUser();

    return (
        user?.role ===
        "SUPER_ADMIN"
    );
}

/*
|--------------------------------------------------------------------------
| Business User Check
|--------------------------------------------------------------------------
*/

export function isBusinessUser() {
    const user =
        getCurrentUser();

    return Boolean(
        user &&
            user.role !==
                "SUPER_ADMIN"
    );
}