using HR.Domain.Enums;
using MediatR;

namespace HR.Application.Features.Leaves.Commands.ApplyLeave;

public record ApplyLeaveCommand(
    LeaveType LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    string Reason
) : IRequest<string>; 
