import { modals } from "@mantine/modals";
import { Button, Text, Stack  } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { store } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import React from "react";

import { clearAuthData } from "@/redux/auth/authSlice";

export class AuthErrorHandler {
    private static instance: AuthErrorHandler;

    private constructor() {}

    static getInstance(): AuthErrorHandler {
        if (!AuthErrorHandler.instance) {
            AuthErrorHandler.instance = new AuthErrorHandler();
        }
        return AuthErrorHandler.instance;
    }

     handleExpiredToken(): void {
        modals.openConfirmModal({
            title: 'Session Expired',
            centered: true,
            closeOnClickOutside: false,
            closeOnEscape: false,
            withCloseButton: false,
            children: 'Your session has expired due to inactivity. Please log in again to continue.',
            labels: { confirm: 'Login Again', cancel: ''},
            cancelProps:{
                style: { display: 'none'}
            },
            onConfirm: () => {
                store.dispatch(clearAuthData());
                localStorage.removeItem('token');
                window.location.href = '/login';
            },
            onCancel: () => {
                window.location.href = '/login';
            },
        })
    }

      handle401Error(): void {
        notifications.show({
            title: 'Authentication Error',
            message: 'Please login to continue',
            color: 'red'
        });
        this.handleExpiredToken();
    }


}