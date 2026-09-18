using FluentValidation;

namespace HR.Application.Employees.Commands.CreateEmployee;

public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.JobTitle).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Salary).GreaterThan(0);
        RuleFor(x => x.DateOfJoining).NotEmpty();
    }
}

