using HR.Domain.Enums;

namespace HR.Application.Employees.Common;

public class EmployeeDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Department Department { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public EmployeeStatus Status { get; set; }
    public DateTime DateOfJoining { get; set; }
    public DateTime CreatedAt { get; set; }
}