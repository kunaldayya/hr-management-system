using HR.Application.Features.Dashboard.DTOs;
using MediatR;
using System;

namespace HR.Application.Features.Dashboard.Queries
{
    public class GetEmployeeDashboardQuery : IRequest<EmployeeDashboardVm>
    {
        public string EmployeeId { get; set; } = string.Empty;
        public DateOnly LocalToday { get; set; } 
    }
}