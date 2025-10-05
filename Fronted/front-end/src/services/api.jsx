

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Boards
export const getBoards = () => api.get('/boards');
export const getBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);
export const addBoardMember = (boardId, userId) => 
  api.post(`/boards/${boardId}/members`, { userId });
export const removeBoardMember = (boardId, memberId) =>
  api.delete(`/boards/${boardId}/members/${memberId}`);

// Lists
export const createList = (data) => api.post('/lists', data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data);
export const deleteList = (id) => api.delete(`/lists/${id}`);

// Cards
export const getCard = (id) => api.get(`/cards/${id}`);
export const createCard = (data) => api.post('/cards', data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
export const searchCards = (boardId, query) => 
  api.get(`/cards/search/${boardId}`, { params: query });

// Comments
export const getComments = (cardId) => api.get(`/comments/card/${cardId}`);
export const createComment = (data) => api.post('/comments', data);

// Activity
export const getActivities = (boardId) => api.get(`/activity/board/${boardId}`);

// Workspaces
export const getWorkspaces = () => api.get('/workspaces');
export const createWorkspace = (data) => api.post('/workspaces', data);