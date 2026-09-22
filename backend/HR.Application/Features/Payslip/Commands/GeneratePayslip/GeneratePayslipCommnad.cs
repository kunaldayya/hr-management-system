using MediatR;

namespace HR.Application.Features.Payslip.GeneratePayslip;

public record GeneratePayslipCommand(
    string EmployeeId,
    int Month,
    int Year,
    decimal BasicSalary,
    decimal Allowances,
    decimal Deductions
) : IRequest<string>;