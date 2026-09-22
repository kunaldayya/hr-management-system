using MediatR;

namespace HR.Application.Features.Leaves.Commands.ApproveLeave;

public class ApproveLeaveCommand : IRequest<bool>
{
    public string LeaveId { get; set; } = string.Empty;
    public string? AdminRemarks { get; set; }
}