import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

export interface SortableItem {
    readonly id: string;
}

export interface ReorderEvent {
    readonly activeId: string;
    readonly overId: string;
}

interface SortableListProps<T extends SortableItem> {
    readonly items: ReadonlyArray<T>;
    readonly renderItem: (item: T) => ReactNode;
    readonly onReorder: (event: ReorderEvent) => void;
}

interface SortableItemWrapperProps {
    readonly id: string;
    readonly children: ReactNode;
}

const SortableItemWrapper = ({ id, children }: SortableItemWrapperProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging === true ? 0.5 : 1,
        touchAction: 'manipulation' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

export const SortableList = <T extends SortableItem>({
    items,
    renderItem,
    onReorder,
}: SortableListProps<T>) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over !== null && active.id !== over.id) {
            onReorder({
                activeId: String(active.id),
                overId: String(over.id),
            });
        }
    };

    const itemIds = items.map(item => item.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                    <SortableItemWrapper key={item.id} id={item.id}>
                        {renderItem(item)}
                    </SortableItemWrapper>
                ))}
            </SortableContext>
        </DndContext>
    );
};
