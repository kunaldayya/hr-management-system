using HR.Application.Employees.Commands.CreateEmployee;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HR.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly ISender _sender;

        public EmployeesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeCommand command, CancellationToken cancellationToken)
        {
            var employeeId = await _sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(Create), new { id = employeeId }, employeeId);
        }
    }
}
