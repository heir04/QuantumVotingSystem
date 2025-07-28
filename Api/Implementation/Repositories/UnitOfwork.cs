using Api.Context;
using Api.Interface.IRepositories;

namespace Api.Implementation.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationContext _context;
        private bool _disposed = false;
        public IOrganizationRepository Organization { get; }
        public ICandidateRepository Candidate { get; }
        public IVoteRepository Vote { get; }
        public IVoterRepository Voter { get; }
        public IVotingSessionRepository VotingSession { get; }

        public UnitOfWork(
            ApplicationContext context,
            IOrganizationRepository organizationRepository,
            ICandidateRepository candidateRepository,
            IVoteRepository voteRepository,
            IVoterRepository voterRepository,
            IVotingSessionRepository votingSessionRepository
        )
        {
            _context = context;
            Organization = organizationRepository;
            Candidate = candidateRepository;
            Vote = voteRepository;
            Voter = voterRepository;
            VotingSession = votingSessionRepository;
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }
    }
}