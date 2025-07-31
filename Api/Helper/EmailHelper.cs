using System.Net;
using System.Net.Mail;
using Api.Entities;
namespace Api.Helper
{
    public class EmailHelper(IConfiguration configuration)
    {
        private readonly IConfiguration _configuration = configuration;
        public async Task SendVoteInviteEmailAsync(string toEmail, string organizationName, string voterId, VotingSession votingSession)
        {
            string? MailServer = _configuration["EmailSettings:MailServer"];
            string? FromEmail = _configuration["EmailSettings:FromEmail"];
            string? Password = _configuration["EmailSettings:Password"];
            string? SenderName = _configuration["EmailSettings:SenderName"];
            int Port = Convert.ToInt32(_configuration["EmailSettings:MailPort"]);

            var subject = $"Voting Invitation: {votingSession.Title} - {organizationName}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #2c3e50; text-align: center;'>🗳️ Voting Invitation</h2>
                        
                        <p>Dear Voter,</p>
                        
                        <p>You have been invited to participate in a voting session organized by <strong>{organizationName}</strong>.</p>
                        
                        <div style='background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;'>
                            <h3 style='color: #1565c0; margin-top: 0; text-align: center;'>📋 Voting Session Details</h3>
                            <div style='background-color: #fff; padding: 15px; border-radius: 5px;'>
                                <p style='margin: 5px 0;'><strong>Session Title:</strong> {votingSession.Title}</p>
                                <p style='margin: 5px 0;'><strong>Voting Date:</strong> {votingSession.VotingDate:dddd, MMMM dd, yyyy}</p>
                                <p style='margin: 5px 0;'><strong>Start Time:</strong> {votingSession.StartTime:HH:mm} UTC</p>
                                <p style='margin: 5px 0;'><strong>End Time:</strong> {votingSession.EndTime:HH:mm} UTC</p>
                            </div>
                        </div>
                        
                        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <h3 style='color: #495057; margin-top: 0;'>🔑 Your Voting Credentials:</h3>
                            <p><strong>Voter ID:</strong> {voterId}</p>
                            <p><strong>Access Code:</strong> {voterId}</p>
                        </div>
                        
                        <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                            <h4 style='color: #856404; margin-top: 0;'>⏰ Important Timing Information:</h4>
                            <ul style='color: #856404; margin-bottom: 0;'>
                                <li>Voting opens on <strong>{votingSession.VotingDate:MMMM dd, yyyy}</strong> at <strong>{votingSession.StartTime:HH:mm} UTC</strong></li>
                                <li>Voting closes on <strong>{votingSession.VotingDate:MMMM dd, yyyy}</strong> at <strong>{votingSession.EndTime:HH:mm} UTC</strong></li>
                                <li>Make sure to vote within this timeframe</li>
                            </ul>
                        </div>
                        
                        <p>Please use your credentials to log in to <a href=""https://qvote.com"" style=""color: #007bff; text-decoration: none;"">qvote.com</a> and cast your vote during the specified voting period.</p>
                        
                        <p><strong>Important Security Notes:</strong></p>
                        <ul>
                            <li>Keep your credentials secure and do not share them with anyone</li>
                            <li>You can only vote during the specified time window</li>
                            <li>Contact the organization if you encounter any issues</li>
                            <li>Each voter can only vote once per session</li>
                        </ul>
                        
                        <p>Thank you for your participation in <strong>{votingSession.Title}</strong>!</p>
                        
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #6c757d; text-align: center;'>
                            This is an automated message from QVote Quantum Voting System.<br>
                            Session: {votingSession.Title} | Date: {votingSession.VotingDate:yyyy-MM-dd}
                        </p>
                    </div>
                </body>
                </html>";

            var client = new SmtpClient(MailServer, Port)
            {
                Credentials = new NetworkCredential(FromEmail, Password),
                EnableSsl = true,
            };
    
            MailAddress fromAddress = new MailAddress(FromEmail!, SenderName);
            using MailMessage mailMessage = new MailMessage
            {
                From = fromAddress,
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);
            await client.SendMailAsync(mailMessage);
        }

        public async Task SendVoteTokenEmailAsync(string toEmail, string voterId, string voteToken)
        {
            string? MailServer = _configuration["EmailSettings:MailServer"];
            string? FromEmail = _configuration["EmailSettings:FromEmail"];
            string? Password = _configuration["EmailSettings:Password"];
            string? SenderName = _configuration["EmailSettings:SenderName"];
            int Port = Convert.ToInt32(_configuration["EmailSettings:MailPort"]);

            var subject = $"Your Quantum Vote Token - Ready to Vote!";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #2c3e50; text-align: center;'>🔐 Your Quantum Vote Token</h2>
                        
                        <p>Dear Voter,</p>
                        
                        <p>You have successfully logged in and received your quantum-generated vote token! <strong>You can now proceed to cast your vote.</strong></p>
                        
                        <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                            <h3 style='color: #155724; margin-top: 0; text-align: center;'>🎯 Your Vote Token</h3>
                            <div style='background-color: #fff; padding: 15px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; color: #495057; border: 2px dashed #28a745;'>
                                {voteToken}
                            </div>
                            <p style='margin-bottom: 0; font-size: 14px; color: #6c757d; text-align: center; margin-top: 10px;'>
                                <em>Use this token to cast your vote</em>
                            </p>
                        </div>
                        
                        <div style='background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;'>
                            <h4 style='color: #0c5460; margin-top: 0;'>🗳️ Next Steps - Cast Your Vote:</h4>
                            <ol style='color: #0c5460; margin-bottom: 0;'>
                                <li>Return to the voting platform</li>
                                <li>Enter this token when prompted</li>
                                <li>Select your preferred candidate</li>
                                <li>Submit your vote securely</li>
                            </ol>
                        </div>
                        
                        <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                            <h4 style='color: #856404; margin-top: 0;'>🔒 Important Security Notes:</h4>
                            <ul style='color: #856404; margin-bottom: 0;'>
                                <li><strong>This token is required to vote</strong> - keep it secure until you cast your vote</li>
                                <li>Each token can only be used once</li>
                                <li>Do not share this token with anyone</li>
                                <li>Vote within the designated time frame</li>
                            </ul>
                        </div>
                        
                        <div style='background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;'>
                            <p style='margin: 0; color: #721c24; font-weight: bold;'>
                                ⚠️ Don't forget to vote! Your token expires when the voting period ends.
                            </p>
                        </div>
                        
                        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <p style='margin: 0; font-size: 14px; color: #6c757d;'>
                                <strong>Voter ID:</strong> {voterId}<br>
                                <strong>Token Generated:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC<br>
                                <strong>Status:</strong> Ready to Vote
                            </p>
                        </div>
                        
                        <p style='text-align: center;'>
                            <strong>Ready to make your voice heard? Use your token to vote now!</strong>
                        </p>
                        
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #6c757d; text-align: center;'>
                            This is an automated message from QVote Quantum Voting System.<br>
                            Your token was generated using quantum cryptography for maximum security.
                        </p>
                    </div>
                </body>
                </html>";

            var client = new SmtpClient(MailServer, Port)
            {
                Credentials = new NetworkCredential(FromEmail, Password),
                EnableSsl = true,
            };
    
            MailAddress fromAddress = new MailAddress(FromEmail!, SenderName);
            using MailMessage mailMessage = new MailMessage
            {
                From = fromAddress,
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);
            await client.SendMailAsync(mailMessage);
        }
    }
}