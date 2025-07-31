using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.DTOs;
using Api.Interface.IServices;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationController(IOrganizationService organizationService) : ControllerBase
    {
        private readonly IOrganizationService _organizationService = organizationService;

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromForm] CreateOrganizationDto organizationDto)
        {
            var result = await _organizationService.Create(organizationDto);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("Get/{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var result = await _organizationService.Get(id);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetByCurrentId()
        {
            var result = await _organizationService.GetByCurrentId();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _organizationService.GetAll();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromForm] UpdateOrganizationDto organizationDto)
        {
            var result = await _organizationService.Update(organizationDto, id);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        // [HttpPost("Delete/{id}")]
        //     public async Task<IActionResult> Delete([FromRoute] Guid id)
        // {
        //     var result = await _organizationService.Delete(id);
        //     return result.Status ? Ok(result) : BadRequest(result);
        // }
    }
}