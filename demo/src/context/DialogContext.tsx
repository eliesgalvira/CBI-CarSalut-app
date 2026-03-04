import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Alert } from 'react-native';

type DialogButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type DialogOptions = {
  title: string;
  message?: string;
  buttons?: DialogButton[];
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const showDialog = useCallback((options: DialogOptions) => {
    Alert.alert(options.title, options.message, options.buttons as any);
  }, []);

  const value = useMemo(() => ({ showDialog }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }

  return context;
}
