// src/redux/actions/chatActions.js

import { SEND_MESSAGE, START_TYPING, STOP_TYPING } from './actionTypes';

export const sendMessage = (messageData) => ({
    type: SEND_MESSAGE,
    payload: messageData,
});

export const startTyping = (data) => ({
    type: START_TYPING,
    payload: data,
});

export const stopTyping = (data) => ({
    type: STOP_TYPING,
    payload: data,
});