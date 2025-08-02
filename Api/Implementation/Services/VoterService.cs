using CsvHelper;
using Api.DTOs;
using Api.Interface.IServices;
using System.Globalization;
using Api.Helper;
using Api.Entities;
using Api.Interface.IRepositories;
using BCrypt.Net;

namespace Api.Implementation.Services
{
    public class VoterService(IUnitOfWork unitOfWork, HelperMethods helperMethods, IQuantumService quantumService, EmailHelper emailHelper) : IVoterService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly HelperMethods _helperMethods = helperMethods;
        private readonly IQuantumService _quantumService = quantumService;
        private readonly EmailHelper _emailHelper = emailHelper;

        public async Task<BaseResponse<IEnumerable<VoterStatusDto>>> Create(Guid votingSessionId, IFormFile file)
        {
            var response = new BaseResponse<IEnumerable<VoterStatusDto>>();
            var votersStatus = new List<VoterStatusDto>();

            if (votingSessionId == Guid.Empty)
            {
                response.Message = "Valid voting session ID is required";
                return response;
            }

            if (file == null || file.Length == 0)
            {
                response.Message = "CSV file is required";
                return response;
            }

            var organizationId = _helperMethods.GetUserId();
            if (organizationId == Guid.Empty)
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var votingSession = await _unitOfWork.VotingSession.GetAsync(votingSessionId);
            if (votingSession == null)
            {
                response.Message = "Voting session not found";
                return response;
            }

            if (votingSession.OrganizationId != organizationId)
            {
                response.Message = "Not authorized to upload voters to this session";
                return response;
            }

            if (DateTime.UtcNow > votingSession.VotingDate.ToDateTime(TimeOnly.MinValue))
            {
                response.Message = "Cannot upload voters after voting has ended";
                return response;
            }

            var organization = await _unitOfWork.Organization.GetAsync(organizationId);
            if (organization == null)
            {
                response.Message = "Organization not found";
                return response;
            }

            var reader = new StreamReader(file.OpenReadStream());
            var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = csv.GetRecords<VoterCsvDto>().ToList();
            if (!records.Any())
            {
                response.Message = "No voters found in the CSV file";
                return response;
            }

            var validVoters = 0;

            for (int i = 0; i < records.Count; i++)
            {
                var voter = records[i];
                var rowNumber = i + 2;

                if (string.IsNullOrWhiteSpace(voter.Email))
                {
                    votersStatus.Add(new VoterStatusDto
                    {
                        Message = $"Row {rowNumber}: Email is required",
                        Status = "failed"
                    });
                    continue;
                }

                if (!_helperMethods.IsValidEmail(voter.Email))
                {
                    votersStatus.Add(new VoterStatusDto
                    {
                        Message = $"Row {rowNumber}: Invalid email format '{voter.Email}'",
                        Status = "failed"
                    });
                    continue;
                }

                var existingEmails = await _unitOfWork.Voter.ExistsAsync(v => v.Email == voter.Email && v.VotingSessionId == votingSession.Id);

                if (existingEmails)
                {
                    votersStatus.Add(new VoterStatusDto
                    {
                        Message = $"Row {rowNumber}: Email '{voter.Email}' already exists in this voting session",
                        Status = "failed"
                    });
                    continue;
                }

                try
                {
                    var voterId = $"VTR{Guid.NewGuid().ToString().Replace("-", "")[..5].ToUpper()}";
                    var pin = voterId;
                    byte[] salt = await _quantumService.GenerateQuantumSaltBatchedAsync();
                    string saltString = BitConverter.ToString(salt).Replace("-", "");
                    string hashedPin = HashingHelper.HashPassword(pin, saltString);

                    var newVoter = new Voter
                    {
                        AccessPin = hashedPin,
                        HashSalt = saltString,
                        Email = voter.Email,
                        VoterId = voterId,
                        RoleName = "Voter",
                        VotingSessionId = votingSession.Id
                    };

                    validVoters += 1;

                    await _unitOfWork.Voter.Create(newVoter);

                    votersStatus.Add(new VoterStatusDto
                    {
                        Message = $"Row {rowNumber}: Voter processed successfully",
                        Status = "success"
                    });
                }
                catch (Exception ex)
                {
                    votersStatus.Add(new VoterStatusDto
                    {
                        Message = $"Row {rowNumber}: Error processing voter data - {ex.Message}",
                        Status = "failed"
                    });
                }
            }

            // Save all changes at once for better performance
            if (validVoters > 0)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            response.Data = votersStatus;
            response.Status = true;
            response.Message = $"Processed {records.Count} voters. {validVoters} successful, {votersStatus.Count(vs => vs.Status == "failed")} failed.";
            return response;
        }

        public async Task<BaseResponse<IEnumerable<VoterDto>>> GetAll(Guid votingSessionId)
        {
            var response = new BaseResponse<IEnumerable<VoterDto>>();

            var organizationId = _helperMethods.GetUserId();
            if (organizationId == Guid.Empty)
            {
                response.Message = "Not authorised";
                return response;
            }

            var voters = await _unitOfWork.Voter.GetAll(v => v.VotingSessionId == votingSessionId);

            var votingSession = await _unitOfWork.VotingSession.GetAsync(votingSessionId);

            if (votingSession is null)
            {
                response.Message = "Voting Session not found";
                return response;
            }

            if (votingSession.OrganizationId != organizationId)
            {
                response.Message = "Not authorised";
                return response;
            }

            if (!voters.Any())
            {
                response.Message = "No voters found";
                return response;
            }

            response.Data = voters.Select(v => new VoterDto
            {
                Id = v.Id,
                Email = v.Email,
                VoterId = v.VoterId,
                HasVoted = v.HasVoted
            }).ToList();
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<string>> SendVotesInviteEmail(Guid votingSessionId)
        {
            var response = new BaseResponse<string>();

            var votingSession = await _unitOfWork.VotingSession.GetAsync(votingSessionId);
            if (votingSession is null)
            {
                response.Message = "Voting Session not found";
                return response;
            }

            var organizationId = _helperMethods.GetUserId();
            var organization = await _unitOfWork.Organization.GetAsync(organizationId);
            if (organization is null)
            {
                response.Message = "Organization not found";
                return response;
            }

            if (votingSession.OrganizationId != organizationId)
            {
                response.Message = "Not authorised";
                return response;
            }

            var voters = await _unitOfWork.Voter.GetAll(v => v.VotingSessionId == votingSessionId && !v.HasVoted);
            if (voters is null || !voters.Any())
            {
                response.Message = "No voters found for this voting session";
                return response;
            }

            foreach (var voter in voters)
            {
                await _emailHelper.SendVoteInviteEmailAsync(voter.Email, organization.Name, voter.VoterId, votingSession);
            }

            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<string>> GenerateToken()
        {
            var response = new BaseResponse<string>();

            var voterId = _helperMethods.GetUserId();
            if (voterId == Guid.Empty)
            {
                response.Message = "Not authorised";
                return response;
            }

            var voter = await _unitOfWork.Voter.GetAsync(voterId);
            if (voter is null)
            {
                response.Message = "Not found";
                return response;
            }

            if (voter.TokenGenerated)
            {
                response.Message = "Can not generate multiple tokens";
                return response;
            }

            var currentDateTime = DateTime.UtcNow;
            var currentDate = DateOnly.FromDateTime(currentDateTime);
            var currentTime = TimeOnly.FromDateTime(currentDateTime);

            if (voter.VotingSession.VotingDate < currentDate)
            {
                response.Message = "Voting session has ended";
                return response;
            }

            if (voter.VotingSession.VotingDate > currentDate)
            {
                response.Message = "Voting session has not started yet";
                return response;
            }

            if (voter.VotingSession.VotingDate == currentDate)
            {
                if (currentTime < voter.VotingSession.StartTime)
                {
                    response.Message = "Voting session has not started yet";
                    return response;
                }

                if (currentTime > voter.VotingSession.EndTime)
                {
                    response.Message = "Voting session has ended";
                    return response;
                }
            }

            var token = await _quantumService.GenerateQuantumCodeAsync();
            if (string.IsNullOrEmpty(token))
            {
                response.Message = "Failed to generate quantum token";
                return response;
            }

            try
            {
                voter.TokenHash = BCrypt.Net.BCrypt.HashPassword(token);
                voter.TokenGenerated = true;

                await _emailHelper.SendVoteTokenEmailAsync(voter.Email, voter.VoterId, token);

                await _unitOfWork.SaveChangesAsync();

                response.Data = token;
                response.Message = "Vote token generated successfully, Check your email for the token.";
                response.Status = true;
                return response;
            }
            catch (Exception)
            {
                response.Message = "Failed to save token or send email. Please try again.";
                return response;
            }
        }

        public async Task<BaseResponse<UpdateVoterDto>> Update(UpdateVoterDto voterDto, Guid voterId)
        {
            var response = new BaseResponse<UpdateVoterDto>();

            var voter = await _unitOfWork.Voter.GetAsync(voterId);
            if (voter is null)
            {
                response.Message = "Not found";
                return response;
            }

            voter.Email = voterDto.Email;

            await _unitOfWork.SaveChangesAsync();
            response.Message = "Success";
            return response;
        }
    }
}