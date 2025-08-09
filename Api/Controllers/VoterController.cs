using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.DTOs;
using Api.Interface.IRepositories;
using Api.Interface.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoterController(IVoterService voterService) : ControllerBase
    {
        private readonly IVoterService _voterService = voterService;

        [HttpPost("Create/{votingSessionId}")]
        [Authorize(Roles = "Organization")]
        public async Task<IActionResult> Create([FromRoute] Guid votingSessionId, IFormFile file)
        {
            var result = await _voterService.Create(votingSessionId, file);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetAll/{votingSessionId}")]
        [Authorize(Roles = "Organization")]
        public async Task<IActionResult> GetAll([FromRoute] Guid votingSessionId)
        {
            var result = await _voterService.GetAll(votingSessionId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("GenerateToken")]
        [Authorize(Roles = "Voter")]
        public async Task<IActionResult> GenerateToken()
        {
            var result = await _voterService.GenerateToken();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("SendVotesEmail/{votingSessionId}")]
        [Authorize(Roles = "Organization")]
        public async Task<IActionResult> SendVotesEmail([FromRoute] Guid votingSessionId)
        {
            var result = await _voterService.SendVotesInviteEmail(votingSessionId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPut("Update/{voterId}")]
        [Authorize(Roles = "Organization")]
        public async Task<IActionResult> Update([FromRoute] Guid voterId, UpdateVoterDto voterDto)
        {
            var result = await _voterService.Update(voterDto, voterId);
            return result.Status ? Ok(result) : BadRequest(result);
        }
    }
}