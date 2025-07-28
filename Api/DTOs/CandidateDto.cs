namespace Api.DTOs
{
    public class CandidateDto
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string Position { get; set; }
        public int VotesCount { get; set; }
        // public Guid VotingSessionId { get; set; }
        // public VotingSessionDto? VotingSession { get; set; }
    }

    public class CreateCandidateDto
    {
        public required string FullName { get; set; }
        public required string Position { get; set; }
        public string? PhotoUrl { get; set; }
        public Guid VotingSessionId { get; set; }
    }

    public class UpdateCandidateDto
    {
        public required string FullName { get; set; }
        public required string Position { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
