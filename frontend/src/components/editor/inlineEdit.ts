import { createContext } from 'react';

export interface InlineEdit {
  begin: () => void;
  end: () => void;
}

export const InlineEditContext = createContext<InlineEdit | null>(null);
