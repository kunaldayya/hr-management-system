using HR.Application.Common.Exceptions;
using HR.Application.Common.Models;
using Microsoft.AspNetCore.Diagnostics;

namespace HR.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occured: {Message}", exception.Message);

        var (statusCode, apiResponse) = exception switch
        {
            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                ApiResponse<object>.Failure(notFoundEx.Message)
            ),
            ValidationException validEx => (
                StatusCodes.Status400BadRequest,
                ApiResponse<object>.Failure(validEx.Message, validEx.Errors)
            ),
            UnauthorizedAccessException unauthEx => (
                StatusCodes.Status401Unauthorized,
                ApiResponse<object>.Failure(unauthEx.Message)
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An unexpected server error occurred.")
            )
        };

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(apiResponse, cancellationToken);

        return true;

    }
}