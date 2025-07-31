using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using Api.DTOs;
using Api.Entities;
using Api.Helper;
using Api.Interface.IRepositories;
using Api.Interface.IServices;
using CsvHelper;

namespace Api.Implementation.Services
{
    public class VotingSessionService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, HelperMethods helperMethods, EmailHelper emailHelper) : IVotingSessionService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly HelperMethods _helperMethods = helperMethods;
        private readonly EmailHelper _emailHelper = emailHelper; 
        public async Task<BaseResponse<CreateVotingSessionDto>> Create(CreateVotingSessionDto votingSessionDto)
        {
            var response = new BaseResponse<CreateVotingSessionDto>();

            if (votingSessionDto.StartTime >= votingSessionDto.EndTime)
            {
                response.Message = "Start time must be before end time";
                return response;
            }

            if (votingSessionDto.VotingDate < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            {
                response.Message = "Voting date cannot be in the past";
                return response;
            }

            if (votingSessionDto.Candidates == null || !votingSessionDto.Candidates.Any())
            {
                response.Message = "At least one candidate is required";
                return response;
            }

            var duplicateNames = votingSessionDto.Candidates.GroupBy(c => c.FullName.Trim().ToLower())
                .Where(g => g.Count() > 1)
                .Select(g => g.Key);

            if (duplicateNames.Any())
            {
                response.Message = "Duplicate candidate names are not allowed";
                return response;
            }

            var organizationId = _helperMethods.GetUserId();
            if (organizationId == Guid.Empty)
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var organization = await _unitOfWork.Organization.GetAsync(organizationId);
            if (organization == null)
            {
                response.Message = "Organization not found";
                return response;
            }

            var votingSession = new VotingSession
            {
                Title = votingSessionDto.Title,
                Description = votingSessionDto.Description,
                StartTime = votingSessionDto.StartTime,
                EndTime = votingSessionDto.EndTime,
                VotingDate = votingSessionDto.VotingDate,
                OrganizationId = organizationId
            };
            await _unitOfWork.VotingSession.Create(votingSession);

            foreach (var candidate in votingSessionDto.Candidates)
            {
                var newCandidate = new Candidate
                {
                    FullName = candidate.FullName,
                    Position = candidate.Position,
                    VotingSessionId = votingSession.Id
                };
                await _unitOfWork.Candidate.Create(newCandidate);
            }

            await _unitOfWork.SaveChangesAsync();

            response.Status = true;
            response.Message = "Voting session created successfully.";
            return response;
        }

        
        public async Task<BaseResponse<VotingSessionDto>> Get(Guid id)
        {
            var response = new BaseResponse<VotingSessionDto>();

            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var organizationId))
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var votingSession = await _unitOfWork.VotingSession.GetVotingSession(id);
            if (votingSession == null)
            {
                response.Message = "Not found";
                return response;
            }
            var votes = await _unitOfWork.Vote.GetAll(v => v.VotingSessionId == votingSession.Id);

            if (votingSession.OrganizationId != organizationId)
            {
                response.Message = "Not authorised";
                return response;
            }

            response.Data = new VotingSessionDto
            {
                Title = votingSession.Title,
                Description = votingSession.Description,
                StartTime = votingSession.StartTime,
                EndTime = votingSession.EndTime,
                VotingDate = votingSession.VotingDate,
                OrganizationId = votingSession.OrganizationId,
                Candidates = votingSession.Candidates.Select(c => new CandidateDto
                {

                    Id = c.Id,
                    FullName = c.FullName,
                    Position = c.Position,
                    VotesCount = votes.Count(v => v.CandidateId == c.Id)
                }).ToList(),
                Voters = votingSession.Voters.Select(v => new VoterDto
                {
                    Email = v.Email,
                    VoterId = v.VoterId,
                    HasVoted = v.HasVoted
                }).ToList()
            };

            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<IEnumerable<VotingSessionDto>>> GetActiveSessions()
        {
            var response = new BaseResponse<IEnumerable<VotingSessionDto>>();

            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var currentTime = TimeOnly.FromDateTime(DateTime.UtcNow);

            var activeSessions = await _unitOfWork.VotingSession.GetAll(vs =>
                vs.OrganizationId == userId &&
                (vs.VotingDate > currentDate ||
                 (vs.VotingDate == currentDate && vs.StartTime <= currentTime && vs.EndTime >= currentTime)));

            if (!activeSessions.Any())
            {
                response.Message = "No active sessions found";
                return response;
            }

            response.Data = activeSessions.Select(vs => new VotingSessionDto
            {
                Id = vs.Id,
                Title = vs.Title,
                Description = vs.Description,
                StartTime = vs.StartTime,
                EndTime = vs.EndTime,
                VotingDate = vs.VotingDate,
                OrganizationId = vs.OrganizationId
            });

            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<IEnumerable<VotingSessionDto>>> GetAll()
        {
            var response = new BaseResponse<IEnumerable<VotingSessionDto>>();
            var organizationId = _helperMethods.GetUserId();
            if (organizationId == Guid.Empty)
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var votingSessions = await _unitOfWork.VotingSession.GetAll(vs => vs.OrganizationId == organizationId);
            if (!votingSessions.Any())
            {
                response.Message = "Not found";
                return response;
            }

            response.Data = votingSessions.Select(vs => new VotingSessionDto
            {
                Id = vs.Id,
                Title = vs.Title,
                Description = vs.Description,
                StartTime = vs.StartTime,
                EndTime = vs.EndTime,
                VotingDate = vs.VotingDate,
                OrganizationId = vs.OrganizationId
            });

            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<UpdateVotingSessionDto>> Update(UpdateVotingSessionDto votingSessionDto, Guid votingSessionId)
        {
            var response = new BaseResponse<UpdateVotingSessionDto>();

            // Input validation
            if (votingSessionId == Guid.Empty)
            {
                response.Message = "Valid voting session ID is required";
                return response;
            }

            if (votingSessionDto.StartTime >= votingSessionDto.EndTime)
            {
                response.Message = "Start time must be before end time";
                return response;
            }

            if (votingSessionDto.VotingDate < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            {
                response.Message = "Voting date cannot be in the past";
                return response;
            }

            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var votingSession = await _unitOfWork.VotingSession.GetAsync(votingSessionId);

            if (votingSession == null)
            {
                response.Message = "Not found";
                return response;
            }

            if (votingSession.OrganizationId != userId)
            {
                response.Message = "Not authorised";
                return response;
            }

            if (DateTime.UtcNow > votingSession.VotingDate.ToDateTime(TimeOnly.MinValue))
            {
                response.Message = "Voting ended";
                return response;
            }

            votingSession.Title = votingSessionDto.Title;
            votingSession.Description = votingSessionDto.Description;
            votingSession.StartTime = votingSessionDto.StartTime;
            votingSession.EndTime = votingSessionDto.EndTime;
            votingSession.VotingDate = votingSessionDto.VotingDate;

            await _unitOfWork.SaveChangesAsync();
            response.Message = "Success";
            response.Status = true;
            return response;
        }
    }
}