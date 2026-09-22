import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Button,
  Spinner,
  Badge,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import type { BadgeProps } from '@fluentui/react-components';
import { EditRegular, DeleteRegular } from '@fluentui/react-icons';
import { useQueryClient } from '@tanstack/react-query';

import {
  useGetApiEmployees,
  useDeleteApiEmployeesId,
  getGetApiEmployeesQueryKey,
} from '../../../api/generated/employees/employees';
import type { EmployeeDto, GetApiEmployeesParams } from '../../../api/generated/model';

const DEPARTMENT_MAP: Record<string | number, string> = {
  0: 'Engineering',
  1: 'Human Resources',
  2: 'Finance',
  3: 'Marketing',
  4: 'Sales',
  5: 'Operations',
  Engineering: 'Engineering',
  HumanResources: 'Human Resources',
  Finance: 'Finance',
  Marketing: 'Marketing',
  Sales: 'Sales',
  Operations: 'Operations',
};

interface StatusConfig {
  label: string;
  color: BadgeProps['color'];
}

const STATUS_MAP: Record<string | number, StatusConfig> = {
  0: { label: 'Active', color: 'success' },
  1: { label: 'Probation', color: 'warning' },
  2: { label: 'On Leave', color: 'informative' },
  3: { label: 'Terminated', color: 'danger' },
  Active: { label: 'Active', color: 'success' },
  Probation: { label: 'Probation', color: 'warning' },
  OnLeave: { label: 'On Leave', color: 'informative' },
  Terminated: { label: 'Terminated', color: 'danger' },
};

const getDepartmentLabel = (dept: any): string => {
  if (dept === undefined || dept === null) return 'N/A';
  return DEPARTMENT_MAP[dept] ?? String(dept);
};

const getStatusConfig = (status: any): StatusConfig => {
  if (status === undefined || status === null) {
    return { label: 'Unknown', color: 'informative' };
  }
  return STATUS_MAP[status] ?? { label: String(status), color: 'informative' };
};

interface EmployeeTableProps {
  onEdit: (employee: EmployeeDto) => void;
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
  const queryClient = useQueryClient();

  const [pageIndex, setPageIndex] = useState<number>(1);
  const pageSize = 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams: GetApiEmployeesParams = { pageIndex, pageSize };
  const { data: rawResponse, isLoading } = useGetApiEmployees(queryParams);

  const apiResponseBody = (rawResponse as any)?.data ?? rawResponse;
  const paginatedData = apiResponseBody?.data ?? apiResponseBody;

  const employees: EmployeeDto[] = paginatedData?.items ?? [];
  const totalCount: number = paginatedData?.totalCount ?? 0;
  const totalPages: number = paginatedData?.totalPages ?? 1;

  const deleteMutation = useDeleteApiEmployeesId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiEmployeesQueryKey() });
        setDeleteId(null);
      },
    },
  });

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col gap-4">
      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <Spinner label="Loading employees…" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[650px]" aria-label="Employee Table">
            <TableHeader className="border-b border-slate-200 bg-slate-50">
              <TableRow>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Name</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Email</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Job Title</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Department</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Status</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3">Date of Joining</TableHeaderCell>
                <TableHeaderCell className="!font-semibold !text-slate-700 !py-3 text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  const statusInfo = getStatusConfig(emp.status);

                  return (
                    <TableRow key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <TableCellLayout className="whitespace-nowrap font-medium text-slate-800">
                          {`${emp.firstName ?? ''} ${emp.lastName ?? ''}`}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell className="text-slate-600">{emp.email ?? '-'}</TableCell>
                      <TableCell className="text-slate-600">{emp.jobTitle ?? '-'}</TableCell>
                      <TableCell className="text-slate-600">{getDepartmentLabel(emp.department)}</TableCell>
                      <TableCell>
                        <Badge color={statusInfo.color} appearance="tint" className="!rounded-sm font-medium">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-600">
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          appearance="subtle"
                          icon={<EditRegular className="text-slate-600" />}
                          onClick={() => onEdit(emp)}
                          className="!rounded-sm hover:!bg-slate-200/60"
                        />
                        <Button
                          appearance="subtle"
                          icon={<DeleteRegular className="text-red-600" />}
                          onClick={() => emp.id && setDeleteId(emp.id)}
                          className="!rounded-sm hover:!bg-red-50"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Container */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600 font-medium">
        <span>
          Page <strong className="text-slate-800">{pageIndex}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalCount} total)
        </span>
        <div className="flex gap-2">
          <Button
            size="small"
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex((p) => p - 1)}
            className="!rounded-sm"
          >
            Previous
          </Button>
          <Button
            size="small"
            disabled={pageIndex >= totalPages}
            onClick={() => setPageIndex((p) => p + 1)}
            className="!rounded-sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(_, data) => !data.open && setDeleteId(null)}>
        <DialogSurface className="!rounded-md !p-6 max-w-sm w-full bg-white border border-slate-200">
          <DialogBody>
            <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-3">
              Confirm Delete
            </DialogTitle>
            <DialogContent className="text-sm text-slate-600 py-2">
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogContent>
            <DialogActions className="pt-4 mt-2 border-t border-slate-200">
              <Button appearance="secondary" onClick={() => setDeleteId(null)} className="!rounded-sm">
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
                disabled={deleteMutation.isPending}
                className="!rounded-sm !bg-red-600 hover:!bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}