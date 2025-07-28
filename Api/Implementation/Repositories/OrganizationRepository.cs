using Api.Context;
using Api.Entities;
using Api.Interface.IRepositories;

namespace Api.Implementation.Repositories
{
    public class OrganizationRepository : BaseRepository<Organization>, IOrganizationRepository
    {
        public OrganizationRepository(ApplicationContext context)
        {
            _context = context;
        }
    }
}