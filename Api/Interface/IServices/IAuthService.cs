using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IAuthService
    {
        Task<BaseResponse<VoterLoginDto>> VoterLogin(VoterLoginDto loginDto);
        Task<BaseResponse<OrganizationLoginDto>> OrganizationLogin(OrganizationLoginDto loginDto);
    }
}