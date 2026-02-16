import { message } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

type NotificationArgs = Parameters<(typeof message)['error']>[0];
type NotificationResult = ReturnType<(typeof message)['error']>;
type MessageApi = ReturnType<(typeof message)['useMessage']>[0];

let notificationApi: MessageApi | undefined;

export const setNotificationApi = (api: MessageApi): void => {
    notificationApi = api;
};

export interface NotificationApi {
    readonly success: (args: NotificationArgs) => NotificationResult;
    readonly error: (args: NotificationArgs) => NotificationResult;
    readonly info: (args: NotificationArgs) => NotificationResult;
    readonly warning: (args: NotificationArgs) => NotificationResult;
    readonly loading: (args: NotificationArgs) => NotificationResult;
}

const open = (type: NotificationType, args: NotificationArgs) => {
    const api = notificationApi ?? message;

    return api[type](args);
};

export const Notification: NotificationApi = {
    success: (args: NotificationArgs) => open('success', args),
    error: (args: NotificationArgs) => open('error', args),
    info: (args: NotificationArgs) => open('info', args),
    warning: (args: NotificationArgs) => open('warning', args),
    loading: (args: NotificationArgs) => open('loading', args),
};

export type NotificationDep = {
    readonly notification: NotificationApi;
};
