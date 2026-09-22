using MediatR;

namespace HR.Application.Features.Leaves.Commands.RejectLeave;

public class RejectLeaveCommand : IRequest<bool>
{
    public string LeaveId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}