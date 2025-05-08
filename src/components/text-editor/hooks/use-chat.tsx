"use client";

import { useChat as useBaseChat } from "ai/react";

export const useChat = () => {
  return useBaseChat({
    id: "editor",
    api: "/api/ai/command",
  });
};
