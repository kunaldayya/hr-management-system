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
} from '../../api/generated/leaves/leaves';
import type { LeaveType } from '../../api/generated/model';

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

  // Reset form on modal close
  useEffect(() => {
    if (!isModalOpen) {
      setLeaveType('Annual' as LeaveType);
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  }, [isModalOpen]);

  // 1. Role-based query hooks
  const adminQuery = useGetApiLeaves({ query: { enabled: isAdmin } });
  const employeeQuery = useGetApiLeavesMyLeaves({ query: { enabled: !isAdmin } });

  const activeQuery = isAdmin ? adminQuery : employeeQuery;
  const activeQueryKey = isAdmin ? getGetApiLeavesQueryKey() : getGetApiLeavesMyLeavesQueryKey();

  const leavesData = (activeQuery.data as any)?.data ?? activeQuery.data;
  const leaves = Array.isArray(leavesData) ? leavesData : leavesData?.data ?? [];

  // Helper function to update status inside different API response structures
  const updateStatusInCache = (oldData: any, targetId: string, newStatus: string) => {
    if (!oldData) return oldData;

    const updateItem = (item: any) =>
      item.id === targetId ? { ...item, status: newStatus } : item;

    if (Array.isArray(oldData)) {
      return oldData.map(updateItem);
    }
    if (Array.isArray(oldData.data)) {
      return { ...oldData, data: oldData.data.map(updateItem) };
    }
    if (Array.isArray(oldData.data?.data)) {
      return {
        ...oldData,
        data: { ...oldData.data, data: oldData.data.data.map(updateItem) },
      };
    }

    return oldData;
  };

  // 2. Mutations with OPTIMISTIC UPDATES
  const applyLeaveMutation = usePostApiLeaves({
    mutation: {
      onSuccess: () => {
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: activeQueryKey });
      },
    },
  });

  const approveMutation = usePutApiLeavesIdApprove({
    mutation: {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: activeQueryKey });
        const previousLeaves = queryClient.getQueryData(activeQueryKey);

        queryClient.setQueryData(activeQueryKey, (oldData: any) =>
          updateStatusInCache(oldData, variables.id, 'Approved')
        );

        return { previousLeaves };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousLeaves) {
          queryClient.setQueryData(activeQueryKey, context.previousLeaves);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: activeQueryKey });
      },
    },
  });

  const rejectMutation = usePutApiLeavesIdReject({
    mutation: {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: activeQueryKey });
        const previousLeaves = queryClient.getQueryData(activeQueryKey);

        queryClient.setQueryData(activeQueryKey, (oldData: any) =>
          updateStatusInCache(oldData, variables.id, 'Rejected')
        );

        return { previousLeaves };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousLeaves) {
          queryClient.setQueryData(activeQueryKey, context.previousLeaves);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: activeQueryKey });
      },
    },
  });

  // Action Handlers
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    applyLeaveMutation.mutate({
      data: {
        leaveType,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T00:00:00`).toISOString(),
        reason,
      },
    });
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate({
      id,
      data: {
        adminRemarks: 'Approved',
      },
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({
      id,
      data: {
        reason: 'Rejected',
      },
    });
  };

  // Helper function to resolve enum status representation
  const getStatusBadgeConfig = (status: any) => {
    if (status === 'Approved' || status === 1 || status === '1') {
      return { label: 'Approved', color: 'success' as const };
    }
    if (status === 'Rejected' || status === 2 || status === '2') {
      return { label: 'Rejected', color: 'danger' as const };
    }
    return { label: 'Pending', color: 'warning' as const };
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Review and process employee leave applications.'
              : 'Submit and manage your personal leave requests.'}
          </p>
        </div>

        <Button
          appearance="primary"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto !rounded-md !bg-blue-600 hover:!bg-blue-700 shadow-sm"
        >
          + Apply for Leave
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="w-full">
        {activeQuery.isLoading ? (
          <div className="py-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500 flex items-center gap-2 justify-center">
            <Spinner size="small" />
            <span>Loading leave requests...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
            No leave requests found.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
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
                    {leaves.map((leave: any, index: number) => {
                      const employeeName = leave.employeeName ?? leave.employeeId ?? 'My Request';
                      const statusConfig = getStatusBadgeConfig(leave.status);
                      const isPending = leave.status === 'Pending' || leave.status === 0 || leave.status === '0';

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
                            <Badge appearance="tint" color={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right whitespace-nowrap">
                              {isPending ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="small"
                                    appearance="primary"
                                    onClick={() => handleApprove(leave.id)}
                                    disabled={approveMutation.isPending}
                                    className="!bg-emerald-600 hover:!bg-emerald-700 text-white !rounded-sm"
                                  >
                                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                  </Button>
                                  <Button
                                    size="small"
                                    appearance="outline"
                                    onClick={() => handleReject(leave.id)}
                                    disabled={rejectMutation.isPending}
                                    className="border-red-200 text-red-600 hover:bg-red-50 !rounded-sm"
                                  >
                                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No actions</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {leaves.map((leave: any, index: number) => {
                const employeeName = leave.employeeName ?? leave.employeeId ?? 'My Request';
                const statusConfig = getStatusBadgeConfig(leave.status);
                const isPending = leave.status === 'Pending' || leave.status === 0 || leave.status === '0';

                return (
                  <div
                    key={leave.id ?? index}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{employeeName}</h3>
                        <p className="text-xs text-slate-500 font-medium">Type: {leave.leaveType}</p>
                      </div>
                      <Badge appearance="tint" color={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-500">Dates: </span>
                        {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : ''} –{' '}
                        {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : ''}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Reason: </span>
                        <span className="text-slate-700">{leave.reason}</span>
                      </div>
                    </div>

                    {isAdmin && isPending && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100 mt-1">
                        <Button
                          size="small"
                          appearance="primary"
                          onClick={() => handleApprove(leave.id)}
                          disabled={approveMutation.isPending}
                          className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 text-white !rounded-md"
                        >
                          {approveMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          size="small"
                          appearance="outline"
                          onClick={() => handleReject(leave.id)}
                          disabled={rejectMutation.isPending}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 !rounded-md"
                        >
                          {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Apply Leave Modal */}
      <Dialog open={isModalOpen} onOpenChange={(_, data) => !data.open && setIsModalOpen(false)}>
        <DialogSurface className="!rounded-lg !p-4 sm:!p-6 max-w-lg w-[calc(100vw-2rem)] sm:w-full bg-white border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleApplyLeave}>
            <DialogBody>
              <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
                Apply for Leave
              </DialogTitle>

              <DialogContent className="flex flex-col gap-4 py-1">
                <div className="flex flex-col gap-1.5">
                  <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Leave Type
                  </Label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="h-10 px-3 rounded-md border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-600 w-full"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Sick">Sick</option>
                    <option value="Casual">Casual</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(_, d) => setStartDate(d.value)}
                      required
                      className="!rounded-md"
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
                      className="!rounded-md"
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
                    className="!rounded-md"
                  />
                </div>
              </DialogContent>

              <DialogActions className="pt-4 mt-4 border-t border-slate-200 flex flex-row justify-end gap-2">
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={applyLeaveMutation.isPending}
                  className="!rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  type="submit"
                  disabled={applyLeaveMutation.isPending}
                  className="!rounded-md !bg-blue-600 hover:!bg-blue-700"
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