export const MAX_CONTEXT_MESSAGES = 12;
export const MAX_STORED_CHAT_MESSAGES = 30;

export const prepareChatHistory = (history, newMessage) => {
    const safeHistory = Array.isArray(history) ? history : [];
    const updatedHistory = [...safeHistory, newMessage].slice(-MAX_STORED_CHAT_MESSAGES);
    const requestHistory = updatedHistory.slice(-MAX_CONTEXT_MESSAGES);

    // The model endpoint requires each conversation to begin with a user turn.
    while (requestHistory.length && requestHistory[0]?.role !== 'user') {
        requestHistory.shift();
    }

    return { updatedHistory, requestHistory };
};
