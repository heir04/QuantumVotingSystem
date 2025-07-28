namespace Api.DTOs
{
    public class QuantumVoteDto
    {
        public required string QuantumToken { get; set; }
        public int CandidateId { get; set; }
        public required string QuantumSignature { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class QuantumTokenDto
    {
        public required string Token { get; set; }
        public required string QuantumState { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class QuantumSearchResultDto
    {
        public List<VoteResultDto> Results { get; set; } = new List<VoteResultDto>();
        public int SearchIterations { get; set; }
        public double QuantumAdvantage { get; set; }
        public TimeSpan ExecutionTime { get; set; }
    }

    public class QuantumRandomDto
    {
        public required string RandomValue { get; set; }
        public required string QuantumSource { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int BitLength { get; set; }
    }

    public class QuantumTeleportationDto
    {
        public required string SourceState { get; set; }
        public required string TargetState { get; set; }
        public required string TeleportationKey { get; set; }
        public bool Success { get; set; }
        public double Fidelity { get; set; }
    }
}
