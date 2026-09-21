using HR.Domain.Common;
using HR.Domain.Enums;
using MongoDB.Bson.Serialization.Attributes;

namespace HR.Domain.Entities;

[BsonIgnoreExtraElements]
public class Employee : BaseEntity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public Department Department { get; private set; }
    public string JobTitle { get; private set; } = string.Empty;
    public decimal Salary { get; private set; } 
    public EmployeeStatus Status { get; private set; }
    public DateTime DateOfJoining { get; private set; }

    private Employee() { }

    public Employee(
        string firstName, 
        string lastName, 
        string email,
        Department department,
        string jobTitle,
        decimal salary,
        DateTime dateOfJoining
        )
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Department = department;
        JobTitle = jobTitle;
        Salary = salary;
        DateOfJoining = dateOfJoining;
        Status = EmployeeStatus.Probation;
    }

    public void UpdateProfile(string firstName, string lastName, string jobTitle, Department department, decimal salary)
    {
        FirstName = firstName;
        LastName = lastName;
        JobTitle = jobTitle;
        Department = department;
        Salary = salary;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeStatus(EmployeeStatus newStatus)
    {
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

}
