using HR.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HR.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        private ISender? _mediator;
        protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

        protected ApiResponse<T> Response<T>(T data, string message = "Request processed successfully")
        {
            return ApiResponse<T>.Success(data, message);
        }

        protected ApiResponse Response(string message = "Request processed successfully")
        {
            return ApiResponse.Success(message);
        }
    }
}
