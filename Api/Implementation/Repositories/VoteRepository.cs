using Api.Context;
using Api.Entities;
using Api.Interface.IRepositories;

namespace Api.Implementation.Repositories
{
    public class VoteRepository : BaseRepository<Vote>, IVoteRepository
    {
        public VoteRepository(ApplicationContext context)
        {
            _context = context;
        }
    }
}
