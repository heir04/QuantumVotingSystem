namespace Api.Entities
{
    public class Organization : BaseEntity
    {
        public string Name { get; set; }= string.Empty;
        public string Email { get; set; } = string.Empty;         // For login or contact
        public string ContactPerson { get; set; }= string.Empty;
        public string Password { get; set; }= string.Empty;
        public string HashSalt { get; set; }= string.Empty;
        public DateTime CreatedAt { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public ICollection<VotingSession> VotingSessions { get; set; } = [];
    }
}