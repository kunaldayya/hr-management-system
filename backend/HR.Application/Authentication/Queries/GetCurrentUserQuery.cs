using HR.Application.Authentication.Common;

using MediatR;

namespace HR.Application.Features.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<CurreUserDto>;