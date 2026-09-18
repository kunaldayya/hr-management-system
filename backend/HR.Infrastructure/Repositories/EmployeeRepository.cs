using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MongoDB.Driver;

namespace HR.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly IMongoCollection<Employee> _employees;

    public EmployeeRepository(IMongoContext context)
    {
        _employees = context.GetCollection<Employee>("employees");
    }

    public async Task<Employee?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _employees.Find(e => e.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _employees.Find(e => e.Email == email).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _employees.Find(_ => true).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await _employees.InsertOneAsync(employee, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await _employees.ReplaceOneAsync(e => e.Id == employee.Id, employee, cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _employees.DeleteOneAsync(e => e.Id == id, cancellationToken);
    }
}