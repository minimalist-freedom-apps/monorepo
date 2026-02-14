import type { MenuProps as AntMenuProps } from 'antd';
import { Menu as AntMenu } from 'antd';

type AntMenuItems = NonNullable<AntMenuProps['items']>;
type AntMenuClickInfo = Parameters<NonNullable<AntMenuProps['onClick']>>[0];
type AntMenuItem = AntMenuItems[number];

export type MenuItems<Key extends string = string> = ReadonlyArray<
    AntMenuItem & { readonly key: Key; readonly closeOnClick: boolean }
>;

export type MenuClickInfo<Key extends string = string> = Omit<AntMenuClickInfo, 'key'> & {
    readonly key: Key;
    readonly closeOnClick: boolean;
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
    const antMenuItems = items.map(({ closeOnClick, ...item }) => item);

    const handleClick =
        onClick === undefined
            ? undefined
            : (info: AntMenuClickInfo) => {
                  const clickedItem = items.find(item => item.key === info.key);

                  onClick({
                      ...(info as Omit<MenuClickInfo<Key>, 'closeOnClick'>),
                      closeOnClick: clickedItem?.closeOnClick ?? true,
                  });
              };

    return (
        <AntMenu
            items={antMenuItems}
            selectable={selectable}
            className="mf-menu"
            {...(handleClick !== undefined ? { onClick: handleClick } : {})}
        />
    );
};
