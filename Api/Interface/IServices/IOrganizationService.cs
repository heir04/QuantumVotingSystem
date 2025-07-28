using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IOrganizationService
    {
        
        Task<BaseResponse<CreateOrganizationDto>> Create(CreateOrganizationDto OrganizationDto);
        Task<BaseResponse<UpdateOrganizationDto>> Update(UpdateOrganizationDto OrganizationDto, Guid OrganizationId);
        Task<BaseResponse<OrganizationDto>> Get(Guid id);
        Task<BaseResponse<OrganizationDto>> GetByCurrentId();
        Task<BaseResponse<IEnumerable<OrganizationDto>>> GetAll();
    }
}