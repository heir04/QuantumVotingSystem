using Api.DTOs;
using Api.Interface.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VotingSessionController(IVotingSessionService votingSessionService) : ControllerBase
    {
        private readonly IVotingSessionService _votingSessionService = votingSessionService;

        [HttpPost("Create")]
        [Authorize(Roles ="Organization")]
        public async Task<IActionResult> Create(CreateVotingSessionDto votingSessionDto)
        {
            var result = await _votingSessionService.Create(votingSessionDto);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("Get/{id}")]
        [Authorize(Roles ="Organization")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var result = await _votingSessionService.Get(id);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetByVoter")]
        [Authorize(Roles ="Voter")]
        public async Task<IActionResult> Get()
        {
            var result = await _votingSessionService.GetByVoter();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetAll")]
        [Authorize(Roles ="Organization")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _votingSessionService.GetAll();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetActiveSessions")]
        [Authorize(Roles ="Organization")]
        public async Task<IActionResult> GetActiveSessions()
        {
            var result = await _votingSessionService.GetActiveSessions();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPut("Update/{id}")]
        [Authorize(Roles ="Organization")]
        public async Task<IActionResult> Update([FromRoute] Guid id, UpdateVotingSessionDto votingSessionDto)
        {
            var result = await _votingSessionService.Update(votingSessionDto, id);
            return result.Status ? Ok(result) : BadRequest(result);
        }

    }
}