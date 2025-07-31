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
    public class VoteController(IVoteService voteService) : ControllerBase
    {
        private readonly IVoteService _voteService = voteService;

        [HttpPost("Create/{voteToken}")]
        public async Task<IActionResult> Create(CreateVoteDto voteDto, [FromRoute] string voteToken)
        {
            var result = await _voteService.Create(voteDto, voteToken);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetByCandidate/{candidateId}")]
        public async Task<IActionResult> GetByCandidate([FromRoute] Guid candidateId)
        {
            var result = await _voteService.GetByCandidate(candidateId);
            return result.Status ? Ok(result) : BadRequest(result);
        }
    }
}