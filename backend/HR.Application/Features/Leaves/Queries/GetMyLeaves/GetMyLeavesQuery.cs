using MediatR;
using HR.Application.Features.Leaves.Queries.Dtos;

namespace HR.Application.Features.Leaves.Queries.GetMyLeaves;

public record GetMyLeavesQuery : IRequest<List<LeaveRequestDto>>;