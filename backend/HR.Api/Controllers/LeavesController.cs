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
        public async Task<ApiResponse<List<LeaveRequestDto>>> GetAllLeaves()
        {
            var result = await _mediator.Send(new GetAllLeavesQuery());
            return ApiResponse<List<LeaveRequestDto>>.Success(result);
        }

        [HttpPut("{id}/approve")]
        public async Task<ApiResponse<bool>> ApproveLeave(string id, [FromBody] ApproveLeaveCommand command)
        {
            command.LeaveId = id;
            var result = await _mediator.Send(command);
            return ApiResponse<bool>.Success(result, "Leave request approved.");
        }

        [HttpPut("{id}/reject")]
        public async Task<ApiResponse<bool>> RejectLeave(string id, [FromBody] RejectLeaveCommand command)
        {
            command.LeaveId = id;
            var result = await _mediator.Send(command);
            return ApiResponse<bool>.Success(result, "Leave request rejected.");
        }
    }
}