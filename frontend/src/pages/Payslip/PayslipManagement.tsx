import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Label,
  Spinner,
} from '@fluentui/react-components';
import {
  Eye20Regular,
} from '@fluentui/react-icons';

import { usePostApiPayslipsGenerate } from '../../api/generated/payslips/payslips';
import { useGetApiEmployees } from '../../api/generated/employees/employees';
import { axiosInstance } from '../../lib/axios-instance';
import { PayslipView, type PayslipItem } from './PayslipView';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function PayslipManagement({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState(50000);
  const [allowances, setAllowances] = useState(5000);
  const [deductions, setDeductions] = useState(2000);

  // Fetch employees for dropdown if admin/HR
  const { data: employeesResponse } = useGetApiEmployees(
    { pageIndex: 1, pageSize: 100 },
    { query: { enabled: isAdmin } }
  );
  const rawEmployees = (employeesResponse as any)?.data ?? employeesResponse;
  const employees: any[] = rawEmployees?.items ?? rawEmployees?.data?.items ?? [];

  // Fetch payslips based on role
  const payslipsQueryKey = isAdmin ? ['/api/Payslips'] : ['/api/Payslips/my-payslips'];

  const {
    data: payslipsResponse,
    isLoading,
  } = useQuery({
    queryKey: payslipsQueryKey,
    queryFn: () =>
      axiosInstance<any>(isAdmin ? '/api/Payslips' : '/api/Payslips/my-payslips', {
        method: 'GET',
      }),
  });

  const generatePayslipMutation = usePostApiPayslipsGenerate();

  const rawPayslips = (payslipsResponse as any)?.data ?? payslipsResponse;
  const payslips: PayslipItem[] = Array.isArray(rawPayslips)
    ? rawPayslips
    : rawPayslips?.data ?? [];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    generatePayslipMutation.mutate(
      {
        data: {
          employeeId,
          month: Number(month),
          year: Number(year),
          basicSalary: Number(basicSalary),
          allowances: Number(allowances),
          deductions: Number(deductions),
        },
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setEmployeeId('');
          // Automatically invalidates cache so TanStack Query triggers a background auto-refresh
          queryClient.invalidateQueries({ queryKey: ['/api/Payslips'] });
          queryClient.invalidateQueries({ queryKey: ['/api/Payslips/my-payslips'] });
        },
      }
    );
  };

  // Render full standalone view page when a payslip is selected
  if (selectedPayslip) {
    return (
      <PayslipView
        payslip={selectedPayslip}
        onBack={() => setSelectedPayslip(null)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Responsive Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Payslip Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Generate and review employee salary slips.'
              : 'View and download your monthly salary slips.'}
          </p>
        </div>

        {isAdmin && (
          <Button
            appearance="primary"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto !rounded-md !bg-blue-600 hover:!bg-blue-700 shadow-sm"
          >
           + Generate Payslip
          </Button>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full">
        {isLoading ? (
          <div className="py-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500 flex items-center gap-2 justify-center">
            <Spinner size="small" />
            <span>Loading payslips...</span>
          </div>
        ) : payslips.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
            No payslips found.
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto">
                <Table className="w-full text-left text-sm text-slate-600">
                  <TableHeader className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <TableRow>
                      <TableHeaderCell>Employee</TableHeaderCell>
                      <TableHeaderCell>Period</TableHeaderCell>
                      <TableHeaderCell>Basic Salary</TableHeaderCell>
                      <TableHeaderCell>Allowances</TableHeaderCell>
                      <TableHeaderCell>Deductions</TableHeaderCell>
                      <TableHeaderCell>Net Salary</TableHeaderCell>
                      <TableHeaderCell className="text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {payslips.map((p, index) => {
                      const empObj = employees.find((x) => x.id === p.employeeId);
                      const displayName = p.employeeName || (empObj ? `${empObj.firstName} ${empObj.lastName}` : 'Employee');
                      const email = empObj?.email ?? '';
                      const position = empObj?.position ?? empObj?.department ?? 'Employee';
                      const monthName = MONTH_NAMES[(p.month || 1) - 1] || `Month ${p.month}`;

                      return (
                        <TableRow key={p.id ?? index} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                            {displayName}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap">
                            {monthName} {p.year}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap">
                            ${p.basicSalary?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-emerald-600 whitespace-nowrap">
                            +${p.allowances?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-500 whitespace-nowrap">
                            -${p.deductions?.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 whitespace-nowrap">
                            ${p.netSalary?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<Eye20Regular />}
                              onClick={() => setSelectedPayslip({
                                ...p,
                                employeeName: displayName,
                                employeeEmail: email,
                                position: position
                              })}
                              className="!text-blue-600 hover:!bg-blue-50 !rounded-sm font-medium"
                            >
                              View / Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {payslips.map((p, index) => {
                const empObj = employees.find((x) => x.id === p.employeeId);
                const displayName = p.employeeName || (empObj ? `${empObj.firstName} ${empObj.lastName}` : 'Employee');
                const email = empObj?.email ?? '';
                const position = empObj?.position ?? empObj?.department ?? 'Employee';
                const monthName = MONTH_NAMES[(p.month || 1) - 1] || `Month ${p.month}`;

                return (
                  <div
                    key={p.id ?? index}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
                        <p className="text-xs text-slate-500 font-medium">{monthName} {p.year}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block uppercase font-semibold">Net Salary</span>
                        <span className="text-lg font-bold text-blue-600">${p.netSalary?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-md">
                      <div>
                        <span className="text-slate-400 block">Basic</span>
                        <span className="font-medium text-slate-700">${p.basicSalary?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Allowances</span>
                        <span className="font-medium text-emerald-600">+${p.allowances?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Deductions</span>
                        <span className="font-medium text-red-500">-${p.deductions?.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      size="medium"
                      appearance="outline"
                      icon={<Eye20Regular />}
                      onClick={() => setSelectedPayslip({
                        ...p,
                        employeeName: displayName,
                        employeeEmail: email,
                        position: position
                      })}
                      className="w-full !text-blue-600 !border-blue-200 hover:!bg-blue-50 font-medium !rounded-md mt-1"
                    >
                      View / Print
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Generate Payslip Modal */}
      <Dialog open={isModalOpen} onOpenChange={(_, d) => !d.open && setIsModalOpen(false)}>
        <DialogSurface className="!rounded-lg !p-4 sm:!p-6 max-w-lg w-[calc(100vw-2rem)] sm:w-full bg-white border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleGenerate}>
            <DialogBody>
              <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
                Generate Payslip
              </DialogTitle>

              <DialogContent className="flex flex-col gap-4 py-1">
                <div className="flex flex-col gap-1.5">
                  <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Employee
                  </Label>
                  {employees.length > 0 ? (
                    <select
                      value={employeeId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setEmployeeId(id);
                        const emp = employees.find((x) => x.id === id);
                        if (emp?.salary) {
                          setBasicSalary(Number(emp.salary));
                        }
                      }}
                      required
                      className="h-10 px-3 rounded-md border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-600 w-full"
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={employeeId}
                      onChange={(_, d) => setEmployeeId(d.value)}
                      placeholder="Enter Employee ID"
                      required
                      className="!rounded-md"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Month
                    </Label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="h-10 px-3 rounded-md border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-600 w-full"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Year
                    </Label>
                    <Input
                      type="number"
                      value={year.toString()}
                      onChange={(_, d) => setYear(Number(d.value))}
                      required
                      className="!rounded-md"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Basic Salary ($)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={basicSalary.toString()}
                    onChange={(_, d) => setBasicSalary(Number(d.value))}
                    required
                    className="!rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Allowances ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={allowances.toString()}
                      onChange={(_, d) => setAllowances(Number(d.value))}
                      required
                      className="!rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Deductions ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={deductions.toString()}
                      onChange={(_, d) => setDeductions(Number(d.value))}
                      required
                      className="!rounded-md"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-600">Calculated Net Salary:</span>
                  <span className="font-bold text-slate-900 text-base">
                    ${(Number(basicSalary || 0) + Number(allowances || 0) - Number(deductions || 0)).toLocaleString()}
                  </span>
                </div>
              </DialogContent>

              <DialogActions className="pt-4 mt-4 border-t border-slate-200 flex flex-row justify-end gap-2">
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={generatePayslipMutation.isPending}
                  className="!rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  type="submit"
                  disabled={generatePayslipMutation.isPending || !employeeId}
                  className="!rounded-md !bg-blue-600 hover:!bg-blue-700"
                >
                  {generatePayslipMutation.isPending ? 'Generating…' : 'Generate'}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  );
}