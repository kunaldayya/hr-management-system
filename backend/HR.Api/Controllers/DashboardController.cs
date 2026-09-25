using HR.Application.Attendance.Commands;
using HR.Application.DTOs;
using HR.Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;

namespace Dashboard.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("my-dashboard")]
        public async Task<IActionResult> GetMyDashboard()
        {
            var employeeIdClaim = User.FindFirst("EmployeeId")?.Value
                                  ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(employeeIdClaim))
            {
                return Unauthorized("Invalid or missing Employee ID in claims.");
            }

            var query = new GetEmployeeDashboardQuery
            {
                EmployeeId = employeeIdClaim, // Guarantees string type
                LocalToday = DateOnly.FromDateTime(DateTime.UtcNow) // Correct DateOnly conversion
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        //[HttpPost("clock-in")]
        //public async Task<ActionResult<Guid>> ClockIn([FromBody] ClockInRequestDto dto)
        //{
        //    if (string.IsNullOrEmpty(CurrentUserId))
        //        return Unauthorized("User identity claim is missing.");

        //    var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        //    var command = new ClockInCommand(CurrentUserId, dto.Notes, ip);
        //    var recordId = await _mediator.Send(command);

        //    return Ok(recordId);
        //}

        ///// <summary>
        ///// Clock out for the day
        ///// </summary>
        //[HttpPost("clock-out")]
        //public async Task<ActionResult<Guid>> ClockOut([FromBody] ClockOutRequestDto dto)
        //{
        //    if (string.IsNullOrEmpty(CurrentUserId))
        //        return Unauthorized("User identity claim is missing.");

        //    var command = new ClockOutCommand(CurrentUserId, dto.Notes);
        //    var recordId = await _mediator.Send(command);

        //    return Ok(recordId);
        //}
    }
}