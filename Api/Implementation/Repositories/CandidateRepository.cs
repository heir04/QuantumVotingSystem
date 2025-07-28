using Api.Context;
using Api.Entities;
using Api.Interface.IRepositories;

namespace Api.Implementation.Repositories
{
    public class CandidateRepository : BaseRepository<Candidate>, ICandidateRepository
    {
        public CandidateRepository(ApplicationContext context)
        {
            _context = context;
        }
    }
}
