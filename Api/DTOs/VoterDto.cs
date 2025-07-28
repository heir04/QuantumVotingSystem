namespace Api.DTOs
{
    public class VoterDto
    {
        public Guid Id { get; set; }
        public string? VoterId { get; set; }
        public string? Email { get; set; }
        public Guid VotingSessionId { get; set; }
        public VotingSessionDto? VotingSession { get; set; }
        public bool TokenGenerated { get; set; }
        public DateTime? TokenGeneratedAt { get; set; }
        public bool HasVoted { get; set; }
        public DateTime? VotedAt { get; set; }
    }

    public class CreateVoterDto
    {
        public required string VoterId { get; set; }
        public Guid VotingSessionId { get; set; }
        public required string AccessPin { get; set; }
    }

    public class VoterStatusDto
    {
        public string? Message { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateVoterDto
    {
        public required string Email { get; set; }
    }

    public class VoterLoginDto
    {
        public Guid Id { get; set; }
        public string? VoterId { get; set; }
        public string? AccessPin { get; set; }
        public string? RoleName { get; set; }
    }

    public class VoterTokenDto
    {
        public Guid VoterId { get; set; }
        public required string VoteToken { get; set; }
        public DateTime TokenGeneratedAt { get; set; }
    }
    
    public class VoterCsvDto
    {
        public string? Email { get; set; }
    }
}
