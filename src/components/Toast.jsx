import { createContext, useCallback, useContext, useRef, useState } from 'react';

// Port de toast() de guia-ai-first-src/index.html:3139-3143.
const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [on, setOn] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((m) => {
    setMsg(m);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 2400);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div id="toast" className={on ? 'on' : ''}>{msg}</div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
