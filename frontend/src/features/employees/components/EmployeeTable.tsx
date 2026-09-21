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
  makeStyles,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import type { BadgeProps } from '@fluentui/react-components';
import { AddRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons';
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

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    width: '100%',
    boxSizing: 'border-box',
    '@media (max-width: 768px)': {
      padding: '12px',
      borderRadius: '8px',
    },
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto', // Enables clean side-swiping on small screens
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    minWidth: '650px', // Ensures data columns maintain readable widths
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '4px',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingTop: '12px',
    '@media (max-width: 480px)': {
      justifyContent: 'center',
      flexDirection: 'column',
    },
  },
  actionsCell: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
});

interface EmployeeTableProps {
  onAdd: () => void;
  onEdit: (employee: EmployeeDto) => void;
}

export function EmployeeTable({ onAdd, onEdit }: EmployeeTableProps) {
  const styles = useStyles();
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
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button appearance="primary" icon={<AddRegular />} onClick={onAdd}>
          Add Employee
        </Button>
      </div>

      {isLoading ? (
        <Spinner label="Loading employees…" style={{ padding: '40px' }} />
      ) : (
        <div className={styles.tableWrapper}>
          <Table className={styles.table} aria-label="Employee Table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Job Title</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date of Joining</TableHeaderCell>
                <TableHeaderCell className={styles.actionsCell}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  const statusInfo = getStatusConfig(emp.status);

                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <TableCellLayout style={{ whiteSpace: 'nowrap' }}>
                          {`${emp.firstName ?? ''} ${emp.lastName ?? ''}`}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell>{emp.email ?? '-'}</TableCell>
                      <TableCell>{emp.jobTitle ?? '-'}</TableCell>
                      <TableCell>{getDepartmentLabel(emp.department)}</TableCell>
                      <TableCell>
                        <Badge color={statusInfo.color} appearance="tint">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap' }}>
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className={styles.actionsCell}>
                        <Button appearance="subtle" icon={<EditRegular />} onClick={() => onEdit(emp)} />
                        <Button
                          appearance="subtle"
                          icon={<DeleteRegular />}
                          onClick={() => emp.id && setDeleteId(emp.id)}
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

      <div className={styles.paginationContainer}>
        <span>
          Page {pageIndex} of {totalPages} ({totalCount} total)
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => p - 1)}>
            Previous
          </Button>
          <Button disabled={pageIndex >= totalPages} onClick={() => setPageIndex((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(_, data) => !data.open && setDeleteId(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>Are you sure you want to delete this employee?</DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
                disabled={deleteMutation.isPending}
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