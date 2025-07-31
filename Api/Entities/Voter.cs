namespace Api.Entities
{
    public class Voter  : BaseEntity
    {
        public string VoterId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid VotingSessionId { get; set; }
        public VotingSession VotingSession { get; set; } = null!;
        public string? TokenHash { get; set; }
        public bool TokenGenerated { get; set; }
        public DateTime? TokenGeneratedAt { get; set; }
        public string AccessPin { get; set; } = string.Empty;
        public string HashSalt { get; set; } = string.Empty;
        public DateTime? AccessPinSetAt { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public bool HasVoted { get; set; }
    }
}