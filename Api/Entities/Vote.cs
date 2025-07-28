namespace Api.Entities
{
    public class Vote : BaseEntity
    {
        public Guid CandidateId { get; set; }
        public Candidate Candidate { get; set; } = null!;
        public Guid VotingSessionId { get; set; }
        public VotingSession VotingSession { get; set; } = null!;
        public string VoteToken { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}