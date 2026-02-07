import { Divider as AntDivider, theme } from 'antd';

export const Divider = () => {
    const { token } = theme.useToken();

    return (
        <AntDivider
            style={{
                margin: 0,
                borderColor: token.colorTextSecondary,
            }}
        />
    );
};
