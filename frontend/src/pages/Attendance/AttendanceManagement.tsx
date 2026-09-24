import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Spinner,
  Button,
  Select,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Textarea,
} from '@fluentui/react-components';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Edit20Regular,
} from '@fluentui/react-icons';

import {
  useGetApiAttendanceMyRecords,
  useGetApiAttendanceAdminAll,
  usePutApiAttendanceIdManualOverride,
} from '../../api/generated/attendance/attendance';
import { ClockInWidget } from './ClockInWidget';

const MONTHS = [
  { value: 0, label: 'All Months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function AttendanceManagement({ isAdmin }: { isAdmin: boolean }) {
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const pageSize = 10;

  // Manual Override State
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [status, setStatus] = useState('PRESENT');
  const [overrideReason, setOverrideReason] = useState('');

  // 1. Employee history logs
  const { data: myRecordsResponse, isLoading: isMyRecordsLoading } = useGetApiAttendanceMyRecords(
    { month: selectedMonth, year: selectedYear, pageIndex, pageSize },
    { query: { enabled: !isAdmin } }
  );

  // 2. Admin logs
  const {
    data: adminAllResponse,
    isLoading: isAdminAllLoading,
    refetch: refetchAdminRecords,
  } = useGetApiAttendanceAdminAll(
    { pageIndex, pageSize },
    { query: { enabled: isAdmin } }
  );

  // 3. Manual Override Mutation
  const overrideMutation = usePutApiAttendanceIdManualOverride();

  const rawMyRecords = (myRecordsResponse as any)?.data ?? myRecordsResponse;
  const myRecords = rawMyRecords?.items ?? [];
  const myTotalCount = rawMyRecords?.totalCount ?? 0;
  const myTotalPages = Math.ceil(myTotalCount / pageSize) || 1;

  const rawAdminData = (adminAllResponse as any)?.data ?? adminAllResponse;
  const adminRecords = rawAdminData?.records?.items ?? [];
  const adminTotalCount = rawAdminData?.records?.totalCount ?? 0;
  const adminTotalPages = Math.ceil(adminTotalCount / pageSize) || 1;
  const metrics = rawAdminData?.metrics;

  const currentRecords = isAdmin ? adminRecords : myRecords;
  const totalPages = isAdmin ? adminTotalPages : myTotalPages;
  const isLoading = isAdmin ? isAdminAllLoading : isMyRecordsLoading;

  // Open Edit Modal
  const handleOpenEdit = (rec: any) => {
    setEditingRecord(rec);
    setClockInTime(rec.clockInTime ? new Date(rec.clockInTime).toISOString().slice(0, 16) : '');
    setClockOutTime(rec.clockOutTime ? new Date(rec.clockOutTime).toISOString().slice(0, 16) : '');
    setStatus(rec.status || 'PRESENT');
    setOverrideReason('');
  };

  // Submit Manual Override Request
  const handleSaveOverride = () => {
    if (!editingRecord?.id) return;

    overrideMutation.mutate(
      {
        id: editingRecord.id,
        data: {
          clockInTime: clockInTime ? new Date(clockInTime).toISOString() : (null as any),
          clockOutTime: clockOutTime ? new Date(clockOutTime).toISOString() : (null as any),
          status: status as any,
          overrideReason,
        },
      },
      {
        onSuccess: () => {
          setEditingRecord(null);
          refetchAdminRecords();
        },
      }
    );
  };

  const renderStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return <Badge appearance="filled" color="success">PRESENT</Badge>;
      case 'LATE':
        return <Badge appearance="filled" color="warning">LATE</Badge>;
      case 'HALF_DAY':
        return <Badge appearance="tint" color="warning">HALF DAY</Badge>;
      case 'ABSENT':
        return <Badge appearance="filled" color="danger">ABSENT</Badge>;
      default:
        return <Badge appearance="tint" color="informative">{status ?? 'N/A'}</Badge>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance & Time Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Monitor and adjust employee clock-in activities and metrics.'
              : 'Track your daily hours and historical clock-in logs.'}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-3">
            <Select
              value={selectedMonth.toString()}
              onChange={(_, data) => {
                setSelectedMonth(Number(data.value));
                setPageIndex(1);
              }}
              className="!min-w-[130px]"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value.toString()}>
                  {m.label}
                </option>
              ))}
            </Select>

            <Select
              value={selectedYear.toString()}
              onChange={(_, data) => {
                setSelectedYear(Number(data.value));
                setPageIndex(1);
              }}
              className="!min-w-[100px]"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        )}
      </header>

      {/* Clock In Widget (Employees) */}
      {!isAdmin && <ClockInWidget />}

      {/* Metrics Cards (Admin) */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scheduled</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalEmployees ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.presentToday ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Today</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.lateToday ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent Today</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{metrics.absentToday ?? 0}</p>
          </div>
        </div>
      )}

      {/* Logs Table Area */}
      <main className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <Table className="w-full text-left text-sm text-slate-600">
            <TableHeader className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <TableRow>
                {isAdmin && <TableHeaderCell>Employee</TableHeaderCell>}
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Clock In</TableHeaderCell>
                <TableHeaderCell>Clock Out</TableHeaderCell>
                <TableHeaderCell>Total Hours</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Action</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 5} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 justify-center w-full">
                      <Spinner size="small" />
                      Loading records...
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 5} className="py-12 text-center text-slate-500">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((rec: any, idx: number) => (
                  <TableRow key={rec.id ?? idx} className="hover:bg-slate-50/80 transition-colors">
                    {isAdmin && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {rec.employeeName || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium text-slate-900">{rec.date}</TableCell>
                    <TableCell>
                      {rec.clockInTime ? new Date(rec.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </TableCell>
                    <TableCell>
                      {rec.clockOutTime ? new Date(rec.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {rec.totalHours ? `${rec.totalHours} hrs` : '--'}
                    </TableCell>
                    <TableCell>{renderStatusBadge(rec.status)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<Edit20Regular />}
                          onClick={() => handleOpenEdit(rec)}
                        >
                          Override
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Page {pageIndex} of {totalPages} ({isAdmin ? adminTotalCount : myTotalCount} total logs)
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              appearance="subtle"
              icon={<ChevronLeft24Regular />}
              disabled={pageIndex <= 1 || isLoading}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="small"
              appearance="subtle"
              icon={<ChevronRight24Regular />}
              iconPosition="after"
              disabled={pageIndex >= totalPages || isLoading}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {/* Manual Override Modal Dialog */}
      <Dialog open={editingRecord !== null} onOpenChange={(_, d) => !d.open && setEditingRecord(null)}>
        <DialogSurface className="!rounded-xl !p-6 max-w-md w-full">
          <DialogBody>
            <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
              Manual Override Attendance
            </DialogTitle>
            <DialogContent className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Clock In Time</label>
                <Input
                  type="datetime-local"
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Clock Out Time</label>
                <Input
                  type="datetime-local"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                <Select value={status} onChange={(_, d) => setStatus(d.value)}>
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="ABSENT">ABSENT</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Override Reason (Required)</label>
                <Textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. System glitch / Employee forgot to clock in"
                />
              </div>
            </DialogContent>
            <DialogActions className="pt-4 mt-4 border-t border-slate-200">
              <Button appearance="secondary" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSaveOverride}
                disabled={overrideMutation.isPending || !overrideReason.trim()}
                className="!bg-blue-600 hover:!bg-blue-700"
              >
                {overrideMutation.isPending ? 'Saving...' : 'Save Override'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}