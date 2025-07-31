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
    public class VoteService(IUnitOfWork unitOfWork, HelperMethods helperMethods) : IVoteService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly HelperMethods _helperMethods = helperMethods;
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

            var currentDateTime = DateTime.UtcNow;
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