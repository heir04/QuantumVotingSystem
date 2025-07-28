namespace Api.Interface.IRepositories
{
    public interface IUnitOfWork
    {
        IOrganizationRepository Organization { get; }
        ICandidateRepository Candidate { get; }
        IVoteRepository Vote { get; }
        IVoterRepository Voter { get; }
        IVotingSessionRepository VotingSession { get; }
        Task<int> SaveChangesAsync();
    }
}