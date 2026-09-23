using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System.Security.Claims;

namespace HR.Application.Features.Payslips.Queries.GetMyPayslips;

public class GetMyPayslipsQueryHandler : IRequestHandler<GetMyPayslipsQuery, List<PayslipDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMyPayslipsQueryHandler(IMongoContext mongoContext, IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<PayslipDto>> Handle(GetMyPayslipsQuery request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user?.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var payslipsCollection = _mongoContext.GetCollection<HR.Domain.Entities.Payslip>("Payslips");

        var payslips = await payslipsCollection
            .Find(x => x.EmployeeId == userId)
            .SortByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync(cancellationToken);

        var currentUser = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var employeeName = currentUser != null ? $"{currentUser.FirstName} {currentUser.LastName}".Trim() : string.Empty;

        return payslips.Select(p => new PayslipDto
        {
            Id = p.Id,
            EmployeeId = p.EmployeeId,
            EmployeeName = employeeName,
            Month = p.Month,
            Year = p.Year,
            BasicSalary = p.BasicSalary,
            Allowances = p.Allowances,
            Deductions = p.Deductions,
            NetSalary = p.NetSalary,
            GeneratedByAdminId = p.GeneratedByAdminId,
            CreatedAt = p.CreatedAt
        }).ToList();
    }
}