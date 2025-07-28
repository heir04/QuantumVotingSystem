namespace Api.Entities
{
    public class Candidate : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;   
        public Guid VotingSessionId { get; set; }
        public VotingSession VotingSession { get; set; } = null!;
    }
}