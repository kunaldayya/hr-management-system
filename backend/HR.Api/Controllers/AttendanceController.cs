using HR.Application.Attendance.Commands;
using HR.Application.Attendance.Queries;
using HR.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HR.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AttendanceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Gets current user's attendance status for today
        /// </summary>
        [HttpGet("today-status")]
        public async Task<ActionResult<TodayStatusDto>> GetTodayStatus()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("User identity claim is missing.");

            var query = new GetTodayStatusQuery(CurrentUserId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Clock in for the day
        /// </summary>
        [HttpPost("clock-in")]
        public async Task<ActionResult<Guid>> ClockIn([FromBody] ClockInRequestDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("User identity claim is missing.");

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var command = new ClockInCommand(CurrentUserId, dto.Notes, ip);
            var recordId = await _mediator.Send(command);

            return Ok(recordId);
        }

        /// <summary>
        /// Clock out for the day
        /// </summary>
        [HttpPost("clock-out")]
        public async Task<ActionResult<Guid>> ClockOut([FromBody] ClockOutRequestDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("User identity claim is missing.");

            var command = new ClockOutCommand(CurrentUserId, dto.Notes);
            var recordId = await _mediator.Send(command);

            return Ok(recordId);
        }

        /// <summary>
        /// Fetch personal attendance log history
        /// </summary>
        [HttpGet("my-records")]
        public async Task<ActionResult<PagedResponse<TodayStatusDto>>> GetMyRecords(
            [FromQuery] int month = 0,
            [FromQuery] int year = 0,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("User identity claim is missing.");

            var query = new GetMyAttendanceRecordsQuery(CurrentUserId, month, year, pageIndex, pageSize);
            var result = await _mediator.Send(query);

            return Ok(result);
        }

        /// <summary>
        /// Admin view: Fetch all attendance records with daily metrics
        /// </summary>
        [HttpGet("admin-all")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<AdminAttendanceOverviewDto>> GetAdminAll(
            [FromQuery] DateOnly? date,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = new GetAdminAttendanceOverviewQuery(date, pageIndex, pageSize);
            var result = await _mediator.Send(query);

            return Ok(result);
        }

        /// <summary>
        /// Admin view: Manually override or adjust an attendance record
        /// </summary>
        [HttpPut("{id:guid}/manual-override")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> ManualOverride(Guid id, [FromBody] ManualOverrideRequestDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("User identity claim is missing.");

            var command = new ManualOverrideCommand(
                id,
                dto.ClockInTime,
                dto.ClockOutTime,
                dto.Status,
                dto.OverrideReason,
                CurrentUserId
            );

            await _mediator.Send(command);
            return NoContent();
        }
    }
}