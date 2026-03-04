import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { AlertDialog, Host } from '@expo/ui/jetpack-compose';

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

type DialogState = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  dismissText?: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
};

const initialState: DialogState = {
  visible: false,
  title: '',
  message: '',
  confirmText: 'OK',
};

function pickButtons(buttons?: DialogButton[]) {
  if (!buttons || buttons.length === 0) {
    return { confirm: { text: 'OK' } as DialogButton, dismiss: undefined as DialogButton | undefined };
  }

  if (buttons.length === 1) {
    return { confirm: buttons[0], dismiss: undefined as DialogButton | undefined };
  }

  const dismiss = buttons.find((button) => button.style === 'cancel') ?? buttons[0];
  const confirm = [...buttons].reverse().find((button) => button !== dismiss) ?? buttons[buttons.length - 1];
  return { confirm, dismiss };
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = React.useState<DialogState>(initialState);

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  const showDialog = useCallback((options: DialogOptions) => {
    if (Platform.OS !== 'android') {
      Alert.alert(options.title, options.message, options.buttons as any);
      return;
    }

    const { confirm, dismiss } = pickButtons(options.buttons);

    setDialog({
      visible: true,
      title: options.title,
      message: options.message ?? '',
      confirmText: confirm.text || 'OK',
      dismissText: dismiss?.text,
      onConfirm: confirm.onPress,
      onDismiss: dismiss?.onPress,
    });
  }, []);

  const value = useMemo(() => ({ showDialog }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      {Platform.OS === 'android' ? (
        <Host matchContents>
          {children}
          <AlertDialog
            visible={dialog.visible}
            title={dialog.title}
            text={dialog.message}
            confirmButtonText={dialog.confirmText}
            dismissButtonText={dialog.dismissText}
            onConfirmPressed={() => {
              const callback = dialog.onConfirm;
              hideDialog();
              callback?.();
            }}
            onDismissPressed={() => {
              const callback = dialog.onDismiss;
              hideDialog();
              callback?.();
            }}
          />
        </Host>
      ) : (
        children
      )}
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
