import React from 'react';

declare module '@hello-pangea/dnd' {
  export interface DroppableProps {
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: any;
    getContainerForClone?: () => HTMLElement;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      'data-rbd-droppable-id': string;
      'data-rbd-droppable-context-id': string;
    };
    placeholder: React.ReactNode;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
    isUsingPlaceholder: boolean;
  }

  export const Droppable: React.FC<DroppableProps>;
} 