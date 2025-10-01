import { useState } from "react";

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string, duration: number = 3000) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), duration);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  return {
    toastMessage,
    showToast,
    hideToast,
  };
};
