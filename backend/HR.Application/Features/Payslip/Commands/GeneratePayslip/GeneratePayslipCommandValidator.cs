using FluentValidation;
using HR.Application.Features.Payslip.GeneratePayslip;
using HR.Application.Features.Payslips.Commands.GeneratePayslip;

namespace HR.Application.Features.Payslips.Commands.GeneratePayslip;

public class GeneratePayslipCommandValidator : AbstractValidator<GeneratePayslipCommand>
{
    public GeneratePayslipCommandValidator()
    {
        RuleFor(x => x.EmployeeId)
            .NotEmpty().WithMessage("Employee ID is required.");

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12).WithMessage("Month must be between 1 and 12.");

        RuleFor(x => x.Year)
            .GreaterThan(2000).WithMessage("Valid year is required.");

        RuleFor(x => x.BasicSalary)
            .GreaterThan(0).WithMessage("Basic salary must be greater than zero.");

        RuleFor(x => x.Allowances)
            .GreaterThanOrEqualTo(0).WithMessage("Allowances cannot be negative.");

        RuleFor(x => x.Deductions)
            .GreaterThanOrEqualTo(0).WithMessage("Deductions cannot be negative.");
    }
}