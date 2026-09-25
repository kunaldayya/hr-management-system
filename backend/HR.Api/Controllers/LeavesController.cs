using HR.Application.Common.Models;
using HR.Application.Features.Leaves.Commands.ApplyLeave;
using HR.Application.Features.Leaves.Commands.ApproveLeave;
using HR.Application.Features.Leaves.Commands.RejectLeave;
using HR.Application.Features.Leaves.Queries.GetAllLeaves;
using HR.Application.Features.Leaves.Queries.GetMyLeaves;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// Explicitly resolve the ambiguity
using LeaveRequestDto = HR.Application.Features.Leaves.Queries.Dtos.LeaveRequestDto;

namespace HR.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LeavesController : ControllerBase
    {
        private readonly ISender _mediator;

        public LeavesController(ISender mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ApiResponse<string>> ApplyLeave([FromBody] ApplyLeaveCommand command)
        {
            var leaveId = await _mediator.Send(command);
            return ApiResponse<string>.Success(leaveId, "Leave request submitted successfully.");
        }

        [HttpGet("my-leaves")]
        public async Task<ApiResponse<List<LeaveRequestDto>>> GetMyLeaves()
        {
            var result = await _mediator.Send(new GetMyLeavesQuery());
            return ApiResponse<List<LeaveRequestDto>>.Success(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ApiResponse<List<LeaveRequestDto>>> GetAllLeaves()
        {
            var result = await _mediator.Send(new GetAllLeavesQuery());
            return ApiResponse<List<LeaveRequestDto>>.Success(result);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ApiResponse<bool>> ApproveLeave(string id, [FromBody] ApproveLeaveDto? request = null)
        {
            var command = new ApproveLeaveCommand
            {
                LeaveId = id,
                AdminRemarks = request?.AdminRemarks ?? "Approved"
            };

            var result = await _mediator.Send(command, CancellationToken.None);
            return ApiResponse<bool>.Success(result, "Leave request approved.");
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ApiResponse<bool>> RejectLeave(string id, [FromBody] RejectLeaveDto? request)
        {
            var command = new RejectLeaveCommand
            {
                LeaveId = id,
                Reason = request?.Reason ?? "Rejected"
            };

            var result = await _mediator.Send(command, CancellationToken.None);
            return ApiResponse<bool>.Success(result, "Leave request rejected.");
        }
    }

    // Explicit DTOs with default property values
    public class ApproveLeaveDto
    {
        public string? LeaveId { get; set; }
        public string? AdminRemarks { get; set; } = "Approved";
    }

    public class RejectLeaveDto
    {
        public string? LeaveId { get; set; }
        public string? Reason { get; set; } = "Rejected";
    }
}