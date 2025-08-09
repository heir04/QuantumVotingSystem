using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.DTOs;
using Api.Entities;
using Api.Helper;
using Api.Interface.IRepositories;
using Api.Interface.IServices;
using Microsoft.VisualBasic;

namespace Api.Implementation.Services
{
    public class VoteService(IUnitOfWork unitOfWork, HelperMethods helperMethods, IQuantumService quantumService) : IVoteService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly HelperMethods _helperMethods = helperMethods;
        private readonly IQuantumService _quantumService = quantumService;
        public async Task<BaseResponse<CreateVoteDto>> Create(CreateVoteDto voteDto, string voteToken)
        {
            var response = new BaseResponse<CreateVoteDto>();
            var voterId = _helperMethods.GetUserId();
            var voter = await _unitOfWork.Voter.GetAsync(voterId);
            var votingSession = await _unitOfWork.VotingSession.GetVotingSession(voter.VotingSessionId);
            if (votingSession == null)
            {
                response.Message = "Voting session not found";
                return response;
            }
            
            var candidate = await _unitOfWork.Candidate.GetAsync(voteDto.CandidateId);
            if (candidate == null)
            {
                response.Message = "Candidate not found";
                return response;
            }
            var voterValidation = votingSession.Candidates.Contains(candidate);
            if (!voterValidation)
            {
                response.Message = "Not authorised to vote";
                return response;
            }

            if (voteToken is null || !BCrypt.Net.BCrypt.Verify(voteToken, voter.TokenHash))
            {
                response.Message = "Invalid vote token";
                return response;
            }

            if (voter.HasVoted)
            {
                response.Message = "You have already voted";
                return response;
            }

            var currentDateTime = DateTime.Now;
            var currentDate = DateOnly.FromDateTime(currentDateTime);
            var currentTime = TimeOnly.FromDateTime(currentDateTime);

            if (votingSession.VotingDate < currentDate)
            {
                response.Message = "Voting session has ended";
                return response;
            }

            if (votingSession.VotingDate > currentDate)
            {
                response.Message = "Voting session has not started yet";
                return response;
            }

            if (votingSession.VotingDate == currentDate)
            {
                if (currentTime < votingSession.StartTime)
                {
                    response.Message = "Voting session has not started yet";
                    return response;
                }

                if (currentTime > votingSession.EndTime)
                {
                    response.Message = "Voting session has ended";
                    return response;
                }
            }

            var vote = new Vote
            {
                CandidateId = voteDto.CandidateId,
                VoteToken = voteDto.VoteToken,
                VotingSessionId = voter.VotingSessionId
            };

            voter.HasVoted = true;

            await _unitOfWork.Vote.Create(vote);
            await _unitOfWork.SaveChangesAsync();

            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<bool>> VerifyToken(string token)
        {
            var response = new BaseResponse<bool>();
            var voterId = _helperMethods.GetUserId();
            var voter = await _unitOfWork.Voter.GetAsync(voterId);
            if (voter == null)
            {
                response.Message = "Voter not found";
                return response;
            }

            if (voter.TokenHash == null || !BCrypt.Net.BCrypt.Verify(token, voter.TokenHash))
            {
                response.Message = "Invalid vote token";
                return response;
            }

            if (voter.HasVoted)
            {
                response.Message = "You have already voted";
                return response;
            }

            response.Data = true;
            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<string>> FindDuplicates()
        {
            var response = new BaseResponse<string>();

            try
            {
                var votes = await _unitOfWork.Vote.GetAll();
                var votesList = votes.ToList();

                if (!votesList.Any())
                {
                    response.Message = "No votes found to analyze";
                    response.Status = true;
                    return response;
                }

                var duplicateGroups = votesList
                    .GroupBy(v => v.VoteToken)
                    .Where(g => g.Count() > 1)
                    .ToList();

                if (!duplicateGroups.Any())
                {
                    response.Message = "No duplicate tokens found";
                    response.Status = true;
                    return response;
                }
                var firstDuplicate = duplicateGroups.First();
                string duplicateToken = firstDuplicate.Key;

                var allTokens = votesList.Select(v => v.VoteToken).ToList();
                int targetIndex = allTokens.IndexOf(duplicateToken);
                
                int nQubits = (int)Math.Ceiling(Math.Log2(allTokens.Count));
                nQubits = Math.Max(nQubits, 2); 

                response.Message = $"[C#] Detected duplicate token: {duplicateToken} at index {targetIndex}. " +
                                 $"Total votes: {allTokens.Count}, Using {nQubits} qubits for Grover's search.";

                var quantumResult = await _quantumService.GroverSearchAsync(targetIndex, nQubits);

                if (quantumResult == targetIndex)
                {
                    response.Message += $" [Q#] Grover's algorithm successfully found duplicate at index: {quantumResult}";
                    response.Status = true;
                }
                else
                {
                    response.Message += $" [Q#] Grover's algorithm returned index: {quantumResult} (Expected: {targetIndex})";
                    response.Status = true; 
                }

                response.Data = $"Duplicate Analysis: Token '{duplicateToken}' appears {firstDuplicate.Count()} times. " +
                               $"Classical search found at index {targetIndex}. " +
                               $"Quantum Grover's search result: {quantumResult}. " +
                               $"Total duplicates found: {duplicateGroups.Count} unique tokens with duplicates.";

                return response;
            }
            catch (Exception ex)
            {
                response.Message = $"Error during duplicate detection: {ex.Message}";
                response.Status = false;
                return response;
            }
        }

        public Task<BaseResponse<IEnumerable<VoteDto>>> GetAll()
        {
            throw new NotImplementedException();
        }

        public async Task<BaseResponse<VoteDto>> GetByCandidate(Guid candidateId)
        {
            var response = new BaseResponse<VoteDto>();

            var votesCount = await _unitOfWork.Vote.Count(v => v.CandidateId == candidateId);
            var candidate = await _unitOfWork.Candidate.GetAsync(candidateId);
            if (candidate == null)
            {
                response.Message = "Candidate not found";
                return response;
            }

            response.Data = new VoteDto
            {
                VoteCount = votesCount,
                Candidate = candidate.FullName,
                Position = candidate.Position,
            };
            response.Message = "Success";
            response.Status = true;
            return response;
        }
    }
}