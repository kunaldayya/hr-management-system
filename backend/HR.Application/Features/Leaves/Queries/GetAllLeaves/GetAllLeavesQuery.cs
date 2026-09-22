using MediatR;
using HR.Application.Features.Leaves.Queries.Dtos;

namespace HR.Application.Features.Leaves.Queries.GetAllLeaves;

public record GetAllLeavesQuery : IRequest<List<LeaveRequestDto>>;