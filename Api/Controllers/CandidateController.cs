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
    [Authorize(Roles = "Organization")]
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController(ICandidateService candidateService) : ControllerBase
    {
        private readonly ICandidateService _candidateService = candidateService;
    
        [HttpGet("GetByVotingSession/{votingSessionId}")]
        public async Task<IActionResult> Get([FromRoute] Guid votingSessionId)
        {
            var result = await _candidateService.GetByVotingSession(votingSessionId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, UpdateCandidateDto candidateDto)
        {
            var result = await _candidateService.Update(candidateDto, id);
            return result.Status ? Ok(result) : BadRequest(result);
        }
    }
}