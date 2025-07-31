using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.DTOs;
using Api.Helper;
using Api.Interface.IServices;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService, JwtHelper jwtHelper) : ControllerBase
    {
        private readonly IAuthService _authService = authService;
        private readonly JwtHelper _jwtHelper = jwtHelper;

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] OrganizationLoginDto loginDto)
        {
            var response = await _authService.OrganizationLogin(loginDto);
            if (response.Status == false || response.Data == null)
            {
                return BadRequest(response);
            }

            if (response.Data != null)
            {
                var token = _jwtHelper.GenerateToken(response.Data.Email, response.Data.RoleName, response.Data.Id);
                return Ok(new
                {
                    Token = token
                });
            }
            return Unauthorized(response.Message);
        }
        
        [HttpPost("LoginVoter")]
        public async Task<IActionResult> LoginVoter([FromBody]VoterLoginDto loginDto)
        {
            var response = await _authService.VoterLogin(loginDto);
            if (response.Status == false || response.Data == null)
            {
                return BadRequest(response);
            }

            if (response.Data != null)
            {
                var token = _jwtHelper.GenerateToken(response.Data.VoterId, response.Data.RoleName, response.Data.Id);
                return Ok(new
                {
                    Token = token
                });
            }
            return Unauthorized(response.Message);
        }
    }
}