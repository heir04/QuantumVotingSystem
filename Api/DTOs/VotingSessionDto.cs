namespace Api.DTOs
{
    public class VotingSessionDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public DateOnly VotingDate { get; set; }
        public bool IsActive { get; set; }
        public Guid OrganizationId { get; set; }
        public OrganizationDto? Organization { get; set; }
        public List<CandidateDto> Candidates { get; set; } = new List<CandidateDto>();
        public List<VoterDto> Voters { get; set; } = new List<VoterDto>();
    }

    public class CreateVotingSessionDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
         public DateOnly VotingDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public Guid OrganizationId { get; set; }
        public List<CreateCandidateDto> Candidates { get; set; } = new List<CreateCandidateDto>();
    }

    public class UpdateVotingSessionDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public DateOnly VotingDate { get; set; }
        public bool IsActive { get; set; }
    }
}
