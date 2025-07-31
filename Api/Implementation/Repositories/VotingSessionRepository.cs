using Api.Context;
using Api.Entities;
using Api.Interface.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace Api.Implementation.Repositories
{
    public class VotingSessionRepository : BaseRepository<VotingSession>, IVotingSessionRepository
    {
        public VotingSessionRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task<VotingSession> GetVotingSession(Guid id)
        {
            var result = _context.VotingSessions
                .Where(vs => vs.Id == id)
                .Include(vs => vs.Candidates)
                .Include(vs => vs.Voters)
                .FirstOrDefaultAsync();
            return await result;
        }
    }
}
