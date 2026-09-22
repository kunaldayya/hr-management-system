import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Label,
} from '@fluentui/react-components';

import {
  useGetApiLeaves,
  useGetApiLeavesMyLeaves,
  usePostApiLeaves,
  usePutApiLeavesIdApprove,
  usePutApiLeavesIdReject,
  getGetApiLeavesQueryKey,
  getGetApiLeavesMyLeavesQueryKey,
} from '../api/generated/leaves/leaves';
import type { LeaveType } from '../api/generated/model';

interface LeaveManagementProps {
  isAdmin?: boolean;
}

export function LeaveManagement({ isAdmin = false }: LeaveManagementProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual' as LeaveType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!isModalOpen) {
      setLeaveType('Annual');
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  }, [isModalOpen]);

  // 1. Conditional query fetching based on user role
  const adminQuery = useGetApiLeaves({ query: { enabled: isAdmin } });
  const employeeQuery = useGetApiLeavesMyLeaves({ query: { enabled: !isAdmin } });

  const activeQuery = isAdmin ? adminQuery : employeeQuery;
  const leavesData = (activeQuery.data as any)?.data ?? activeQuery.data;
  const leaves = Array.isArray(leavesData) ? leavesData : leavesData?.data ?? [];

  // 2. Cache Invalidation Helper
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: getGetApiLeavesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetApiLeavesMyLeavesQueryKey() });
  };

  // 3. Mutations
  const applyLeaveMutation = usePostApiLeaves({
    mutation: {
      onSuccess: () => {
        setIsModalOpen(false);
        refreshData();
      },
    },
  });

  const approveMutation = usePutApiLeavesIdApprove({
    mutation: { onSuccess: refreshData },
  });

  const rejectMutation = usePutApiLeavesIdReject({
    mutation: { onSuccess: refreshData },
  });

  // Handlers
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    applyLeaveMutation.mutate({
      data: {
        leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason,
      },
    });
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id, data: { leaveId: id, adminRemarks: 'Approved' } });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ id, data: { leaveId: id, reason: 'Rejected' } });
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Review and process employee leave applications.'
              : 'Submit and manage your personal leave requests.'}
          </p>
        </div>

        {/* Universal Apply for Leave Button */}
        <Button
          appearance="primary"
          onClick={() => setIsModalOpen(true)}
          className="!rounded-sm !bg-blue-600 hover:!bg-blue-700 shadow-sm"
        >
          + Apply for Leave
        </Button>
      </header>

      {/* Leave Requests Table Card */}
      <main className="w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full text-left text-sm text-slate-600">
            <TableHeader className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Reason</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell className="text-right">Actions</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {activeQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 justify-center w-full">
                      <Spinner size="small" />
                      Loading leave requests...
                    </div>
                  </TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave: any, index: number) => {
                  const employeeName = leave.employeeName ?? leave.employeeId ?? 'My Request';

                  return (
                    <TableRow key={leave.id ?? index} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                        {employeeName}
                      </TableCell>
                      <TableCell className="text-slate-600">{leave.leaveType}</TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : ''} –{' '}
                        {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          appearance="tint"
                          color={
                            leave.status === 'Approved'
                              ? 'success'
                              : leave.status === 'Rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right whitespace-nowrap">
                          {leave.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="small"
                                appearance="primary"
                                onClick={() => handleApprove(leave.id)}
                                disabled={approveMutation.isPending}
                                className="!bg-emerald-600 hover:!bg-emerald-700 text-white !rounded-sm"
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                appearance="outline"
                                onClick={() => handleReject(leave.id)}
                                disabled={rejectMutation.isPending}
                                className="border-red-200 text-red-600 hover:bg-red-50 !rounded-sm"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No actions</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Fluent UI Dialog Modal matching EmployeeModal structure */}
      <Dialog open={isModalOpen} onOpenChange={(_, data) => !data.open && setIsModalOpen(false)}>
        <DialogSurface className="!rounded-md !p-6 max-w-lg w-full bg-white border border-slate-200 shadow-xl">
          <form onSubmit={handleApplyLeave}>
            <DialogBody>
              <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
                Apply for Leave
              </DialogTitle>

              <DialogContent className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Leave Type
                  </Label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="h-8 px-3 rounded-sm border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Sick">Sick</option>
                    <option value="Casual">Casual</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(_, d) => setStartDate(d.value)}
                      required
                      className="!rounded-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(_, d) => setEndDate(d.value)}
                      required
                      className="!rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Reason
                  </Label>
                  <Input
                    value={reason}
                    onChange={(_, d) => setReason(d.value)}
                    placeholder="Enter reason for leave"
                    required
                    className="!rounded-sm"
                  />
                </div>
              </DialogContent>

              <DialogActions className="pt-4 mt-4 border-t border-slate-200">
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={applyLeaveMutation.isPending}
                  className="!rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  type="submit"
                  disabled={applyLeaveMutation.isPending}
                  className="!rounded-sm !bg-blue-600 hover:!bg-blue-700"
                >
                  {applyLeaveMutation.isPending ? 'Submitting…' : 'Submit Request'}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  );
}