namespace Api.Entities
{
    public class VotingSession : BaseEntity
    {
        public string Title { get; set; } = string.Empty;                 // e.g. President Election
        public string Description { get; set; } = string.Empty;
        public DateOnly VotingDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public bool IsActive { get; set; } = true;

        public Guid OrganizationId { get; set; }
        public Organization Organization { get; set; } = null!;

        public ICollection<Candidate> Candidates { get; set; } = [];
        public ICollection<Voter> Voters { get; set; } = [];
        public ICollection<Vote> Votes { get; set; } = [];
    }
}