namespace Api.DTOs
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string ContactPerson { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<VotingSessionDto> VotingSessions { get; set; } = new List<VotingSessionDto>();
    }

    public class CreateOrganizationDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public string ContactPerson { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    public class UpdateOrganizationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public  string ContactPerson { get; set; } = string.Empty;
    }

    public class OrganizationLoginDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}
