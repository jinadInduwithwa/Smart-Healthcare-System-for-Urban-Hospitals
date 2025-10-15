import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import Toast from '../components/UI/Toast';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: ToastState[];
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type Action =
  | { type: 'ADD_TOAST'; payload: ToastState }
  | { type: 'REMOVE_TOAST'; payload: number };

const toastReducer = (state: ToastState[], action: Action): ToastState[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number = 5000
  ) => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type, duration } });
  };

  const removeToast = (id: number) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};