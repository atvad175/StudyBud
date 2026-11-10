import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CONTEXT_MESSAGES, MAX_STORED_CHAT_MESSAGES, prepareChatHistory } from '../src/context/chatHistoryUtils.js';

test('chat context ends with the new user message and starts with a user turn', () => {
    const { updatedHistory, requestHistory } = prepareChatHistory([
        { role: 'assistant', content: 'Earlier response' },
        { role: 'user', content: 'Earlier question' },
        { role: 'assistant', content: 'Earlier answer' },
    ], { role: 'user', content: 'Current question' });

    assert.equal(requestHistory[0].role, 'user');
    assert.equal(requestHistory.at(-1).content, 'Current question');
    assert.equal(updatedHistory.length, 4);
});

test('stored chat history and request context remain bounded', () => {
    const history = Array.from({ length: 45 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: 'Message ' + index,
    }));
    const { updatedHistory, requestHistory } = prepareChatHistory(history, {
        role: 'user',
        content: 'Final message',
    });

    assert.equal(updatedHistory.length, MAX_STORED_CHAT_MESSAGES);
    assert.ok(requestHistory.length <= MAX_CONTEXT_MESSAGES);
    assert.equal(requestHistory.at(-1).content, 'Final message');
    assert.equal(requestHistory[0].role, 'user');
});

test('invalid prior history is safely ignored', () => {
    const { updatedHistory, requestHistory } = prepareChatHistory(null, {
        role: 'user',
        content: 'Hello',
    });
    assert.deepEqual(updatedHistory, [{ role: 'user', content: 'Hello' }]);
    assert.deepEqual(requestHistory, updatedHistory);
});
