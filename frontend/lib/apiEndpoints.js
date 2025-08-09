// lib/apiEndpoints.js
// Centralized API endpoints for easy management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/Auth/Login',
    logout: '/Auth/Logout',
    refresh: '/Auth/Refresh'
  },
  
  // Organization/Admin endpoints
  organization: {
    register: '/Organization/Register',
    profile: '/Organization/Profile',
    votingSessions: '/Organization/VotingSessions',
    createSession: '/Organization/VotingSessions',
    updateSession: (id) => `/Organization/VotingSessions/${id}`,
    deleteSession: (id) => `/Organization/VotingSessions/${id}`,
    sessionResults: (id) => `/Organization/VotingSessions/${id}/Results`,
    voters: '/Organization/Voters',
    uploadVoters: '/Organization/Voters/Upload',
    sendInvites: (sessionId) => `/Organization/VotingSessions/${sessionId}/Invites`
  },
  
  // Voter endpoints
  voter: {
    register: '/Voter/Register',
    profile: '/Voter/Profile',
    availableSessions: '/Voter/Sessions',
    vote: (sessionId) => `/Voter/Sessions/${sessionId}/Vote`,
    generateToken: (sessionId) => `/Voter/Sessions/${sessionId}/Token`,
    verifyToken: (sessionId) => `/Voter/Sessions/${sessionId}/VerifyToken`,
    voteHistory: '/Voter/History'
  },
  
  // Common endpoints
  common: {
    health: '/Health',
    version: '/Version'
  }
};

export default API_BASE_URL;
