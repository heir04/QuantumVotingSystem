using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.DTOs;
using Api.Interface.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoteController(IVoteService voteService) : ControllerBase
    {
        private readonly IVoteService _voteService = voteService;

        [HttpPost("Create/{voteToken}")]
        [Authorize(Roles = "Voter")]
        public async Task<IActionResult> Create(CreateVoteDto voteDto, [FromRoute] string voteToken)
        {
            var result = await _voteService.Create(voteDto, voteToken);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("VerifyToken/{token}")]
        [Authorize(Roles = "Voter")]
        public async Task<IActionResult> VerifyToken([FromRoute] string token)
        {
            var result = await _voteService.VerifyToken(token);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetByCandidate/{candidateId}")]
        [Authorize]
        public async Task<IActionResult> GetByCandidate([FromRoute] Guid candidateId)
        {
            var result = await _voteService.GetByCandidate(candidateId);
            return result.Status ? Ok(result) : BadRequest(result);
        }
    }
}