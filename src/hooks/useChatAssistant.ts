import { useState } from "react";

export const useChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    toggleChat,
    openChat,
    closeChat
  };
};