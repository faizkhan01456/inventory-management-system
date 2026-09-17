"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    login as loginUser,
    logout as logoutUser,
    getCurrentUser,
    initializeDemoUsers,
} from "@/lib/auth";

const AuthContext =
    createContext(null);

export function AuthProvider({
    children,
}) {
    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    /*
    |--------------------------------------------------------------------------
    | INITIALIZE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        try {
            /*
             * Initialize demo users only
             * if localStorage doesn't have users.
             */

            initializeDemoUsers();

            /*
             * Check logged-in user.
             */

            const currentUser =
                getCurrentUser();

            if (currentUser) {
                setUser(
                    currentUser
                );
            }
        } catch (error) {
            console.error(
                "Auth initialization error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    const login = (
        username,
        password
    ) => {
        const result =
            loginUser(
                username,
                password
            );

        if (result.success) {
            setUser(
                result.user
            );
        }

        return result;
    };

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const logout = () => {
        logoutUser();

        setUser(null);

        if (
            typeof window !==
            "undefined"
        ) {
            window.location.href =
                "/login";
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,

                loading,

                login,

                logout,

                isAuthenticated:
                    Boolean(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
*/

export function useAuth() {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}