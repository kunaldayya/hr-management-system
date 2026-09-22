using HR.Application.Common.Models;
using HR.Application.Features.Payslip.GeneratePayslip;
using HR.Application.Features.Payslips.Commands.GeneratePayslip;
using HR.Application.Features.Payslips.Queries.GetMyPayslips;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayslipDto = HR.Application.Features.Payslips.Queries.GetMyPayslips.PayslipDto;

namespace HR.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PayslipsController : ControllerBase
    {
        private readonly ISender _mediator;

        public PayslipsController(ISender mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("generate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> GeneratePayslip([FromBody] GeneratePayslipCommand command)
        {
            var payslipId = await _mediator.Send(command);
            return Ok(ApiResponse<string>.Success(payslipId, "Payslip generated successfully."));
        }

        [HttpGet("my-payslips")]
        public async Task<ActionResult<ApiResponse<List<PayslipDto>>>> GetMyPayslips()
        {
            var result = await _mediator.Send(new GetMyPayslipsQuery());
            return Ok(ApiResponse<List<PayslipDto>>.Success(result));
        }
    }
}