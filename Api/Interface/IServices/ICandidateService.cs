using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface ICandidateService
    {
        Task<BaseResponse<UpdateCandidateDto>> Update(UpdateCandidateDto candidateDto, Guid candidateId);
        Task<BaseResponse<IEnumerable<CandidateDto>>> GetByVotingSession(Guid votingSessionId);
    }
}
