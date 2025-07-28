namespace Api.DTOs
{
    public class VoteDto
    {
        public Guid Id { get; set; }
        public Guid CandidateId { get; set; }
        public string? Candidate { get; set; }
        public string? Position { get; set; }
        public int VoteCount { get; set; }
    }

    public class CreateVoteDto
    {
        public Guid CandidateId { get; set; }
        public required string VoteToken { get; set; }
    }

    public class VoteResultDto
    {
        public Guid CandidateId { get; set; }
        public required string CandidateName { get; set; }
        public required string Position { get; set; }
        public int VoteCount { get; set; }
        public double VotePercentage { get; set; }
    }
}
