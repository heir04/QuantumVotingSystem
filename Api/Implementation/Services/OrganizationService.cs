using System.IdentityModel.Tokens.Jwt;
using System.Text.RegularExpressions;

using Api.DTOs;
using Api.Entities;
using Api.Helper;
using Api.Interface.IRepositories;
using Api.Interface.IServices;

namespace Api.Implementation.Services
{
    public class OrganizationService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IQuantumService quantumService) : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly IQuantumService _quantumService = quantumService;

        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                // Use a regex pattern for email validation
                var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
                return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        public async Task<BaseResponse<CreateOrganizationDto>> Create(CreateOrganizationDto OrganizationDto)
        {
            var response = new BaseResponse<CreateOrganizationDto>();

            if (!IsValidEmail(OrganizationDto.Email))
            {
                response.Message = "Please provide a valid email address";
                return response;
            }

            var organizationExists = await _unitOfWork.Organization.ExistsAsync(o => o.Name == OrganizationDto.Name || o.Email == OrganizationDto.Email);
            if (organizationExists)
            {
                response.Message = "Organization with the same name or email already exists.";
                return response;
            }

            try
            {
                byte[] salt = await _quantumService.GenerateQuantumSaltBatchedAsync();
                string saltString = BitConverter.ToString(salt).Replace("-", "");
                string hashedPassword = HashingHelper.HashPassword(OrganizationDto.Password, saltString);

                var organization = new Organization
                {
                    Name = OrganizationDto.Name,
                    Email = OrganizationDto.Email,
                    Password = hashedPassword,
                    HashSalt = saltString,
                    ContactPerson = OrganizationDto.ContactPerson,
                    RoleName = "Organization",
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Organization.Create(organization);
                await _unitOfWork.SaveChangesAsync();
                response.Message = "Organization created successfully";
                response.Status = true;
                return response;
            }
            catch (Exception ex)
            {
                response.Message = $"Failed to generate quantum salt: {ex.Message}";
                response.Status = false;
                return response;
            }
        }

        public async Task<BaseResponse<OrganizationDto>> Get(Guid id)
        {
            var response = new BaseResponse<OrganizationDto>();
            var organization = await _unitOfWork.Organization.GetAsync(id);
            if (organization == null)
            {
                response.Message = "Organization not found.";
                response.Status = false;
                return response;
            }

            response.Data = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Email = organization.Email,
                ContactPerson = organization.ContactPerson,
                CreatedAt = organization.CreatedAt
            };
            response.Status = true;
            response.Message = "Organization retrieved successfully.";
            return response;
        }

        public async Task<BaseResponse<OrganizationDto>> GetByCurrentId()
        {
            var response = new BaseResponse<OrganizationDto>();

            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var organizationId))
            {
                response.Message = "Invalid organization Id";
                return response;
            }

            var organization = await _unitOfWork.Organization.GetAsync(organizationId);
            if (organization == null)
            {
                response.Message = "Organization not found.";
                response.Status = false;
                return response;
            }

            response.Data = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Email = organization.Email.ToLower(),
                ContactPerson = organization.ContactPerson,
                CreatedAt = organization.CreatedAt
            };
            response.Status = true;
            response.Message = "Organization retrieved successfully.";
            return response;
        }

        public async Task<BaseResponse<IEnumerable<OrganizationDto>>> GetAll()
        {
            var response = new BaseResponse<IEnumerable<OrganizationDto>>();
            var organizations = await _unitOfWork.Organization.GetAll();
            if (organizations == null || !organizations.Any())
            {
                response.Message = "No organizations found.";
                response.Status = false;
                return response;
            }

            response.Data = organizations.Select(o => new OrganizationDto
            {
                Id = o.Id,
                Name = o.Name,
                Email = o.Email,
                ContactPerson = o.ContactPerson,
                CreatedAt = o.CreatedAt
            });
            response.Status = true;
            response.Message = "Organizations retrieved successfully.";
            return response;
        }

        public async Task<BaseResponse<UpdateOrganizationDto>> Update(UpdateOrganizationDto OrganizationDto, Guid organizationId)
        {
            var response = new BaseResponse<UpdateOrganizationDto>();

            // Input validation
            if (organizationId == Guid.Empty)
            {
                response.Message = "Valid organization ID is required";
                return response;
            }

            if (!IsValidEmail(OrganizationDto.Email))
            {
                response.Message = "Please provide a valid email address";
                return response;
            }

            var organization = await _unitOfWork.Organization.GetAsync(organizationId);
            if (organization == null)
            {
                response.Message = "Organization not found.";
                response.Status = false;
                return response;
            }

            // Check for duplicate name or email (excluding current organization)
            var duplicateExists = await _unitOfWork.Organization.ExistsAsync(o => 
                o.Id != organizationId && 
                (o.Name == OrganizationDto.Name || o.Email == OrganizationDto.Email));
            
            if (duplicateExists)
            {
                response.Message = "Organization with the same name or email already exists.";
                return response;
            }

            organization.Name = OrganizationDto.Name;
            organization.Email = OrganizationDto.Email;
            organization.ContactPerson = OrganizationDto.ContactPerson;

            await _unitOfWork.SaveChangesAsync();
            response.Status = true;
            response.Message = "Organization updated successfully.";
            return response;
        }
    }
}