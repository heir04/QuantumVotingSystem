using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Helper
{
    public class HelperMethods(IHttpContextAccessor httpContextAccessor)
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public Guid GetUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Guid.Empty;
            }

            return userId;
        }

        public string GetCurrentUserRole()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }

        public static string GenerateRandom6DigitCode()
        {
            var random = new Random();
            var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var result = new char[6];
            
            for (int i = 0; i < 6; i++)
            {
                result[i] = characters[random.Next(characters.Length)];
            }
            
            return new string(result);
        }

        public bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}