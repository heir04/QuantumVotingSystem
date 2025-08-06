using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IVoteService
    {
        Task<BaseResponse<CreateVoteDto>> Create(CreateVoteDto voteDto, string voteToken);
        Task<BaseResponse<bool>> VerifyToken(string token);
        Task<BaseResponse<IEnumerable<VoteDto>>> GetAll();
        Task<BaseResponse<VoteDto>> GetByCandidate(Guid candidateId);
    }
}
