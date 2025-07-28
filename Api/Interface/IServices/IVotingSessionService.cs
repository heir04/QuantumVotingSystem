using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IVotingSessionService
    {
        Task<BaseResponse<CreateVotingSessionDto>> Create(CreateVotingSessionDto votingSessionDto);
        Task<BaseResponse<UpdateVotingSessionDto>> Update(UpdateVotingSessionDto votingSessionDto, Guid votingSessionId);
        Task<BaseResponse<VotingSessionDto>> Get(Guid id);
        Task<BaseResponse<IEnumerable<VotingSessionDto>>> GetAll();
        Task<BaseResponse<IEnumerable<VotingSessionDto>>> GetActiveSessions();
    }
}
