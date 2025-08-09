using Api.DTOs;
using Api.Entities;
using Api.Helper;
using Api.Interface.IRepositories;
using Api.Interface.IServices;

namespace Api.Implementation.Services
{
    public class AuthService(IUnitOfWork unitOfWork) : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        public async Task<BaseResponse<OrganizationLoginDto>> OrganizationLogin(OrganizationLoginDto loginDto)
        {
            var response = new BaseResponse<OrganizationLoginDto>();
            var organization = await _unitOfWork.Organization.Get(x => x.Email == loginDto.Email.ToLower());

            if (organization is null)
            {
                response.Message = $"Incorrect email or password!";
                return response;
            }

            if (organization.HashSalt == null)
            {
                response.Message = $"Incorrect email or password!";
                return response;
            }

            string hashedPassword = HashingHelper.HashPassword(loginDto.Password, organization.HashSalt);
            if (organization.Password == null || !organization.Password.Equals(hashedPassword))
            {
                response.Message = $"Incorrect email or password!";
                return response;
            }


            response.Data = new OrganizationLoginDto
            {
                Id = organization.Id,
                Email = organization.Email,
                RoleName = organization.RoleName ?? string.Empty
            };

            response.Message = "Welcome";
            response.Status = true;
            return response;
        }

        public async Task<BaseResponse<VoterLoginDto>> VoterLogin(VoterLoginDto loginDto)
        {
            var response = new BaseResponse<VoterLoginDto>();
            var voter = await _unitOfWork.Voter.Get(v => v.VoterId == loginDto.VoterId);

            if (voter is null)
            {
                response.Message = $"Incorrect VoterId or password";
                return response;
            }

            if (loginDto.AccessPin is null)
            {
                response.Message = "AccessPin required!";
                return response;
            }

            if (voter.HashSalt == null)
            {
                response.Message = $"Incorrect VoterId or password!";
                return response;
            }

            string hashedPassword = HashingHelper.HashPassword(loginDto.AccessPin, voter.HashSalt);
            if (voter.AccessPin == null || !voter.AccessPin.Equals(hashedPassword))
            {
                response.Message = $"Incorrect VoterId or Access Pin";
                return response;
            }


            response.Data = new VoterLoginDto
            {
                Id = voter.Id,
                VoterId = voter.VoterId,
                RoleName = voter.RoleName ?? string.Empty
            };

            response.Message = "Welcome";
            response.Status = true;
            return response;
        }
    }
}