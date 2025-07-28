using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Context
{
    public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
    {
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<Voter> Voters { get; set; }
        public DbSet<VotingSession> VotingSessions { get; set; }
    }
}