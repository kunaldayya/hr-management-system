import { useState, useMemo } from 'react';
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

// Interfaces for strict type safety
interface AttendanceRecord {
  id: string | number;
  employeeName?: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHours?: number | string;
  status?: string;
}

interface AdminMetrics {
  totalEmployees?: number;
  presentToday?: number;
  lateToday?: number;
  absentToday?: number;
}

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
] as const;

const YEARS = [2024, 2025, 2026, 2027] as const;

export function AttendanceManagement({ isAdmin }: { isAdmin: boolean }) {
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const pageSize = 10;

  // Manual Override Form State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [status, setStatus] = useState('PRESENT');
  const [overrideReason, setOverrideReason] = useState('');

  // 1. Employee Log Query
  const myRecordsQuery = useGetApiAttendanceMyRecords(
    { month: selectedMonth, year: selectedYear, pageIndex, pageSize },
    {
      query: {
        enabled: !isAdmin,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
      },
    }
  );

  // 2. Admin Log Query
  const adminAllQuery = useGetApiAttendanceAdminAll(
    { pageIndex, pageSize },
    {
      query: {
        enabled: isAdmin,
        staleTime: 1000 * 60 * 2, // Cache for 2 mins
      },
    }
  );

  // 3. Manual Override Mutation
  const overrideMutation = usePutApiAttendanceIdManualOverride();

  // Normalize data safely using useMemo for optimized re-renders
  const { currentRecords, totalCount, totalPages, isLoading, metrics } = useMemo(() => {
    if (isAdmin) {
      const rawAdmin = (adminAllQuery.data as any)?.data ?? adminAllQuery.data;
      const records: AttendanceRecord[] = rawAdmin?.records?.items ?? [];
      const count = rawAdmin?.records?.totalCount ?? 0;
      const pages = Math.ceil(count / pageSize) || 1;
      const adminMetrics: AdminMetrics | undefined = rawAdmin?.metrics;

      return {
        currentRecords: records,
        totalCount: count,
        totalPages: pages,
        isLoading: adminAllQuery.isLoading || adminAllQuery.isFetching,
        metrics: adminMetrics,
      };
    } else {
      const rawMy = (myRecordsQuery.data as any)?.data ?? myRecordsQuery.data;
      const records: AttendanceRecord[] = rawMy?.items ?? [];
      const count = rawMy?.totalCount ?? 0;
      const pages = Math.ceil(count / pageSize) || 1;

      return {
        currentRecords: records,
        totalCount: count,
        totalPages: pages,
        isLoading: myRecordsQuery.isLoading || myRecordsQuery.isFetching,
        metrics: undefined,
      };
    }
  }, [
    isAdmin,
    adminAllQuery.data,
    adminAllQuery.isLoading,
    adminAllQuery.isFetching,
    myRecordsQuery.data,
    myRecordsQuery.isLoading,
    myRecordsQuery.isFetching,
    pageSize,
  ]);

  // Open Edit Modal
  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setClockInTime(rec.clockInTime ? new Date(rec.clockInTime).toISOString().slice(0, 16) : '');
    setClockOutTime(rec.clockOutTime ? new Date(rec.clockOutTime).toISOString().slice(0, 16) : '');
    setStatus(rec.status || 'PRESENT');
    setOverrideReason('');
  };

  // Save Override Mutation Handler
  const handleSaveOverride = () => {
    if (!editingRecord?.id) return;

    overrideMutation.mutate(
      {
        id: editingRecord.id as any,
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
          adminAllQuery.refetch();
        },
      }
    );
  };

  const renderStatusBadge = (recStatus?: string) => {
    switch (recStatus?.toUpperCase()) {
      case 'PRESENT':
        return <Badge appearance="filled" color="success">PRESENT</Badge>;
      case 'LATE':
        return <Badge appearance="filled" color="warning">LATE</Badge>;
      case 'HALF_DAY':
        return <Badge appearance="tint" color="warning">HALF DAY</Badge>;
      case 'ABSENT':
        return <Badge appearance="filled" color="danger">ABSENT</Badge>;
      default:
        return <Badge appearance="tint" color="informative">{recStatus ?? 'N/A'}</Badge>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance & Time Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Monitor and adjust employee clock-in activities and metrics.'
              : 'Track your daily hours and historical clock-in logs.'}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Select
              value={selectedMonth.toString()}
              onChange={(_, data) => {
                setSelectedMonth(Number(data.value));
                setPageIndex(1);
              }}
              className="flex-1 sm:flex-initial !min-w-[120px]"
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
              className="flex-1 sm:flex-initial !min-w-[90px]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        )}
      </header>

      {/* Admin Metrics Grid */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Scheduled
            </span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{metrics.totalEmployees ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Present Today
            </span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{metrics.presentToday ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Late Today
            </span>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{metrics.lateToday ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Absent Today
            </span>
            <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">{metrics.absentToday ?? 0}</p>
          </div>
        </div>
      )}

      {/* Main Content Logs Container */}
      <main className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 flex items-center gap-2 justify-center">
            <Spinner size="small" />
            <span className="text-sm">Loading records...</span>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No attendance records found.
          </div>
        ) : (
          <>
            {/* Desktop Table View (md screens & up) */}
            <div className="hidden md:block w-full overflow-x-auto">
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
                  {currentRecords.map((rec, idx) => (
                    <TableRow key={rec.id ?? idx} className="hover:bg-slate-50/80 transition-colors">
                      {isAdmin && (
                        <TableCell>
                          <span className="font-semibold text-slate-900">{rec.employeeName || 'N/A'}</span>
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards View (below md breakpoint) */}
            <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
              {currentRecords.map((rec, idx) => (
                <div
                  key={rec.id ?? idx}
                  className="bg-slate-50/60 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex flex-col">
                      {isAdmin && (
                        <span className="font-bold text-slate-900 text-sm">
                          {rec.employeeName || 'N/A'}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-600">{rec.date}</span>
                    </div>
                    {renderStatusBadge(rec.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium">Clock In</span>
                      <span className="text-slate-800 font-semibold mt-0.5">
                        {rec.clockInTime ? new Date(rec.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium">Clock Out</span>
                      <span className="text-slate-800 font-semibold mt-0.5">
                        {rec.clockOutTime ? new Date(rec.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium">Total</span>
                      <span className="text-slate-900 font-bold mt-0.5">
                        {rec.totalHours ? `${rec.totalHours} hrs` : '--'}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                      <Button
                        size="small"
                        appearance="outline"
                        icon={<Edit20Regular />}
                        onClick={() => handleOpenEdit(rec)}
                        className="w-full sm:w-auto"
                      >
                        Override Entry
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Responsive Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Page {pageIndex} of {totalPages} ({totalCount} total logs)
          </span>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <Button
              size="small"
              appearance="subtle"
              icon={<ChevronLeft24Regular />}
              disabled={pageIndex <= 1 || isLoading}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              className="flex-1 sm:flex-initial"
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
              className="flex-1 sm:flex-initial"
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {/* Manual Override Modal Dialog */}
      <Dialog open={editingRecord !== null} onOpenChange={(_, d) => !d.open && setEditingRecord(null)}>
        <DialogSurface className="!rounded-xl !p-4 sm:!p-6 max-w-md w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
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
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Clock Out Time</label>
                <Input
                  type="datetime-local"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                <Select value={status} onChange={(_, d) => setStatus(d.value)} className="w-full">
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
                  className="w-full"
                />
              </div>
            </DialogContent>
            <DialogActions className="pt-4 mt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              <Button appearance="secondary" onClick={() => setEditingRecord(null)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSaveOverride}
                disabled={overrideMutation.isPending || !overrideReason.trim()}
                className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-700"
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