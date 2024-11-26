// Import the actual types from leva
import type { StoreType as LevaStoreType } from 'leva';

export type { StoreType } from 'leva';

// Define our custom store type that extends the Leva store type
export interface LevaStore extends Omit<LevaStoreType, 'setValueAtPath'> {
  setValueAtPath: {
    (path: string[], value: any, fromPanel?: boolean): void;
    (path: string, value: any, fromPanel: boolean): void;
  };
}

export interface LevaStoreProps {
  store: LevaStoreType;
} 