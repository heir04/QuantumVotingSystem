using Api.Entities;
using Api.Interface.IRepository;

namespace Api.Interface.IRepositories
{
    public interface IVotingSessionRepository : IBaseRepository<VotingSession>
    {
        Task<VotingSession> GetVotingSession(Guid id);
    }
}
