using Api.Context;
using Api.Entities;
using Api.Interface.IRepositories;

namespace Api.Implementation.Repositories
{
    public class VoterRepository : BaseRepository<Voter>, IVoterRepository
    {
        public VoterRepository(ApplicationContext context)
        {
            _context = context;
        }
    }
}
