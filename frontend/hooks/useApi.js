// hooks/useApi.js
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../app/context/AuthContext';
import { API_ENDPOINTS } from '../lib/apiEndpoints';

// Custom hook for making API calls
export const useApi = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(endpoint, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [makeAuthenticatedRequest]);

  return { request, loading, error };
};

// Custom hook for admin/organization operations
export const useAdminApi = () => {
  const { request, loading, error } = useApi();

  const fetchVotingSessions = useCallback(async () => {
    return await request(API_ENDPOINTS.organization.votingSessions);
  }, [request]);

  const createVotingSession = useCallback(async (sessionData) => {
    return await request(API_ENDPOINTS.organization.createSession, {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  }, [request]);

  const updateVotingSession = useCallback(async (sessionId, sessionData) => {
    return await request(API_ENDPOINTS.organization.updateSession(sessionId), {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    });
  }, [request]);

  const deleteVotingSession = useCallback(async (sessionId) => {
    return await request(API_ENDPOINTS.organization.deleteSession(sessionId), {
      method: 'DELETE'
    });
  }, [request]);

  const getSessionResults = useCallback(async (sessionId) => {
    return await request(API_ENDPOINTS.organization.sessionResults(sessionId));
  }, [request]);

  const uploadVoters = useCallback(async (file, sessionId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    return await request(API_ENDPOINTS.organization.uploadVoters, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  }, [request]);

  const sendInvites = useCallback(async (sessionId, voterEmails) => {
    return await request(API_ENDPOINTS.organization.sendInvites(sessionId), {
      method: 'POST',
      body: JSON.stringify({ voterEmails })
    });
  }, [request]);

  return {
    fetchVotingSessions,
    createVotingSession,
    updateVotingSession,
    deleteVotingSession,
    getSessionResults,
    uploadVoters,
    sendInvites,
    loading,
    error
  };
};

// Custom hook for voter operations
export const useVoterApi = () => {
  const { request, loading, error } = useApi();
  const { user } = useAuth();

  const fetchAvailableSessions = useCallback(async () => {
    return await request(API_ENDPOINTS.voter.availableSessions);
  }, [request]);

  const generateVotingToken = useCallback(async (sessionId) => {
    return await request(API_ENDPOINTS.voter.generateToken(sessionId), {
      method: 'POST',
      body: JSON.stringify({ voterId: user?.voterId })
    });
  }, [request, user?.voterId]);

  const verifyToken = useCallback(async (sessionId, token) => {
    return await request(API_ENDPOINTS.voter.verifyToken(sessionId), {
      method: 'POST',
      body: JSON.stringify({ 
        token,
        voterId: user?.voterId 
      })
    });
  }, [request, user?.voterId]);

  const submitVote = useCallback(async (sessionId, voteData) => {
    return await request(API_ENDPOINTS.voter.vote(sessionId), {
      method: 'POST',
      body: JSON.stringify({
        ...voteData,
        voterId: user?.voterId
      })
    });
  }, [request, user?.voterId]);

  const fetchVoteHistory = useCallback(async () => {
    return await request(API_ENDPOINTS.voter.voteHistory);
  }, [request]);

  // Get voter profile/details
  const fetchVoterProfile = useCallback(async () => {
    return await request(API_ENDPOINTS.voter.profile);
  }, [request]);

  return {
    fetchAvailableSessions,
    generateVotingToken,
    verifyToken,
    submitVote,
    fetchVoteHistory,
    fetchVoterProfile,
    loading,
    error
  };
};
