import type { MenuProps as AntMenuProps } from 'antd';
import { Menu as AntMenu } from 'antd';

type AntMenuItems = NonNullable<AntMenuProps['items']>;
type AntMenuClickInfo = Parameters<NonNullable<AntMenuProps['onClick']>>[0];
type AntMenuItem = AntMenuItems[number];

export type MenuItems<Key extends string = string> = ReadonlyArray<
    AntMenuItem & { readonly key: Key }
>;

export type MenuClickInfo<Key extends string = string> = Omit<AntMenuClickInfo, 'key'> & {
    readonly key: Key;
};

interface MenuProps<Key extends string = string> {
    readonly items: MenuItems<Key>;
    readonly selectable?: boolean;
    readonly onClick?: (info: MenuClickInfo<Key>) => void;
}

export const Menu = <Key extends string = string>({
    items,
    selectable = true,
    onClick,
}: MenuProps<Key>) => {
    const handleClick =
        onClick === undefined
            ? undefined
            : (info: AntMenuClickInfo) => {
                  onClick(info as MenuClickInfo<Key>);
              };

    return (
        <AntMenu
            items={items as unknown as AntMenuItems}
            selectable={selectable}
            {...(handleClick !== undefined ? { onClick: handleClick } : {})}
        />
    );
};
