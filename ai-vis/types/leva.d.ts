declare module 'leva' {
  import type { ReactNode } from 'react';
  import type { StoreApi } from 'zustand';

  export type LevaInputs = 'string' | 'number' | 'boolean' | 'select' | 'folder';

  interface State {
    [key: string]: any;
  }

  export interface StoreType extends StoreApi<State> {
    setValueAtPath: (path: string | string[], value: any, fromPanel?: boolean) => void;
    getData: () => Record<string, any>;
    storeId: string;
    orderPaths: string[];
    setOrderedPaths: (paths: string[]) => void;
  }

  export interface LevaProps {
    store?: StoreType;
    fill?: boolean;
    flat?: boolean;
    titleBar?: {
      title?: string;
      drag?: boolean;
      filter?: boolean;
    };
    theme?: Record<string, any>;
  }

  export function useCreateStore(): StoreType;
  export function LevaPanel(props: LevaProps): JSX.Element;
  export function LevaStoreProvider(props: { store: StoreType; children: ReactNode }): JSX.Element;
  export function folder(settings: Record<string, any>): Record<string, any>;
  export function useControls<T>(
    schema: T | (() => T),
    settings?: { store?: StoreType }
  ): T;
  export const Leva: React.ComponentType<LevaProps>;
} 