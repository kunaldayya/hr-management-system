using HR.Application.Common.Interfaces;
using HR.Application.Features.Payslips.Queries.GetMyPayslips;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;
using MongoDB.Driver;

namespace HR.Application.Features.Payslips.Queries.GetAllPayslips;

public class GetAllPayslipsQueryHandler : IRequestHandler<GetAllPayslipsQuery, List<PayslipDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IUserRepository _userRepository;

    public GetAllPayslipsQueryHandler(IMongoContext mongoContext, IUserRepository userRepository)
    {
        _mongoContext = mongoContext;
        _userRepository = userRepository;
    }

    public async Task<List<PayslipDto>> Handle(GetAllPayslipsQuery request, CancellationToken cancellationToken)
    {
        var payslipsCollection = _mongoContext.GetCollection<Domain.Entities.Payslip>("Payslips");

        var payslips = await payslipsCollection
            .Find(FilterDefinition<Domain.Entities.Payslip>.Empty)
            .SortByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync(cancellationToken);

        var users = await _userRepository.GetAllAsync(cancellationToken);
        var userMap = users.ToDictionary(
            u => u.Id,
            u => string.IsNullOrWhiteSpace($"{u.FirstName} {u.LastName}".Trim()) ? u.Email : $"{u.FirstName} {u.LastName}".Trim()
        );

        return payslips.Select(p =>
        {
            userMap.TryGetValue(p.EmployeeId, out var employeeName);

            return new PayslipDto
            {
                Id = p.Id,
                EmployeeId = p.EmployeeId,
                EmployeeName = employeeName ?? p.EmployeeId,
                Month = p.Month,
                Year = p.Year,
                BasicSalary = p.BasicSalary,
                Allowances = p.Allowances,
                Deductions = p.Deductions,
                NetSalary = p.NetSalary,
                GeneratedByAdminId = p.GeneratedByAdminId,
                CreatedAt = p.CreatedAt
            };
        }).ToList();
    }
}
