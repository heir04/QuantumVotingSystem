using Api.DTOs;
using Api.Entities;
using Api.Interface.IRepositories;
using Api.Interface.IServices;

namespace Api.Implementation.Services
{
    public class CandidateService(IUnitOfWork unitOfWork) : ICandidateService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        
        public async Task<BaseResponse<IEnumerable<CandidateDto>>> GetByVotingSession(Guid votingSessionId)
        {
            var response = new BaseResponse<IEnumerable<CandidateDto>>();
            var candidates = await _unitOfWork.Candidate.GetAll(c => c.VotingSessionId == votingSessionId);
            if (!candidates.Any())
            {
                response.Message = "No candidates found";
                return response;
            }

            response.Data = candidates.Select(c => new CandidateDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Position = c.Position
            });
            response.Message = "Success";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<UpdateCandidateDto>> Update(UpdateCandidateDto candidateDto, Guid candidateId)
        {
            var response = new BaseResponse<UpdateCandidateDto>();

            var candidate = await _unitOfWork.Candidate.GetAsync(candidateId);
            if (candidate == null)
            {
                response.Message = "Candidate not found";
                return response;
            }

            candidate.FullName = candidateDto.FullName;
            candidate.Position = candidateDto.Position;

            await _unitOfWork.SaveChangesAsync();

            response.Message = "Success";
            response.Status = true;
            return response;
        }
    }
}