import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

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

type DialogState = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  dismissText?: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

const expoUiAvailable = Platform.OS === 'android' && Boolean((NativeModulesProxy as any).ExpoUI);

type ComposeExports = {
  Host: React.ComponentType<any>;
  AlertDialog: React.ComponentType<any>;
};

let composeUi: ComposeExports | null = null;

if (expoUiAvailable) {
  try {
    composeUi = require('@expo/ui/jetpack-compose');
  } catch {
    composeUi = null;
  }
}

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
  const canUseExpoAlertDialog = Platform.OS === 'android' && Boolean(composeUi?.Host) && Boolean(composeUi?.AlertDialog);
  const HostComponent = composeUi?.Host;
  const AlertDialogComponent = composeUi?.AlertDialog;
  const [dialog, setDialog] = useState<DialogState>(initialState);

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  const showDialog = useCallback((options: DialogOptions) => {
    if (!canUseExpoAlertDialog) {
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
  }, [canUseExpoAlertDialog]);

  const value = useMemo(() => ({ showDialog }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      {canUseExpoAlertDialog && HostComponent && AlertDialogComponent ? (
        <HostComponent matchContents>
          {children}
          <AlertDialogComponent
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
        </HostComponent>
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
