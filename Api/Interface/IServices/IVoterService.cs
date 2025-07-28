using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IVoterService
    {
        Task<BaseResponse<IEnumerable<VoterStatusDto>>> Create(Guid votingSessionId, IFormFile file);
        Task<BaseResponse<UpdateVoterDto>> Update(UpdateVoterDto voterDto, Guid voterId);
        Task<BaseResponse<IEnumerable<VoterDto>>> GetAll(Guid votingSessionId);
        Task<BaseResponse<string>> SendVotesInviteEmail(Guid votingSessionId);
        Task<BaseResponse<string>> GenerateToken();
    }
}
