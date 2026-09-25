import { useMemo } from 'react';
import {
  Badge,
  Spinner,
  Button,
} from '@fluentui/react-components';
import {
  CheckmarkCircle20Filled,
  Clock16Regular,
  Calendar20Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { useGetApiAttendanceMyRecords } from '../../api/generated/attendance/attendance';
import { useGetApiLeavesMyLeaves } from '../../api/generated/leaves/leaves';
import { ClockInWidget } from '../Attendance/ClockInWidget';

// Strict Type Interfaces
interface AttendanceRecord {
  id?: string | number;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHours?: number | string;
  status?: string;
}

interface LeaveRecord {
  id?: string | number;
  type?: string;
  leaveType?: string;
  reason?: string;
  status?: string;
}

interface ChartDataPoint {
  day: string;
  hours: number;
  isShort: boolean;
}

export function EmployeeDashboard() {
  // Generated Hook Calls matching exact Orval signatures
  const { data: myRecordsResponse, isLoading: isAttendanceLoading } = useGetApiAttendanceMyRecords(
    { pageIndex: 1, pageSize: 30 }
  );

  const { data: myLeavesResponse, isLoading: isLeavesLoading } = useGetApiLeavesMyLeaves();

  // Safely memoize raw records extraction
  const records = useMemo<AttendanceRecord[]>(() => {
    const raw = (myRecordsResponse as any)?.data ?? myRecordsResponse;
    return raw?.items ?? raw ?? [];
  }, [myRecordsResponse]);

  // Safely memoize raw leaves extraction
  const leaves = useMemo<LeaveRecord[]>(() => {
    const raw = (myLeavesResponse as any)?.data ?? myLeavesResponse;
    return raw?.items ?? raw ?? [];
  }, [myLeavesResponse]);

  // Extract today's record
  const todayRecord = useMemo<AttendanceRecord | undefined>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return records.find((r) => r.date === todayStr) || records[0];
  }, [records]);

  // Process overall attendance metrics
  const stats = useMemo(() => {
    let presence = 0;
    let absent = 0;
    let onTime = 0;
    let late = 0;
    let totalHoursWorked = 0;

    records.forEach((r) => {
      const status = r.status?.toUpperCase();
      if (status === 'PRESENT' || status === 'LATE') presence++;
      if (status === 'ABSENT') absent++;
      if (status === 'PRESENT') onTime++;
      if (status === 'LATE') late++;
      if (r.totalHours) totalHoursWorked += Number(r.totalHours);
    });

    const leaveTaken = leaves.filter((l) => l.status?.toUpperCase() === 'APPROVED').length;

    return {
      presence,
      absent,
      onTime,
      late,
      leaveTaken,
      totalHoursWorked,
    };
  }, [records, leaves]);

  // Format Recharts data (Last 7 Days)
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const last7 = records.slice(0, 7).reverse();
    return last7.map((r) => {
      const d = new Date(r.date);
      const dayName = isNaN(d.getTime()) ? r.date : d.toLocaleDateString('en-US', { weekday: 'short' });
      const hours = Number(r.totalHours) || 0;
      return {
        day: dayName,
        hours: hours,
        isShort: hours < 8,
      };
    });
  }, [records]);

  // Progress Calculations
  const monthProgress = useMemo(
    () => Math.min(100, Math.round((stats.totalHoursWorked / 187) * 100)),
    [stats.totalHoursWorked]
  );

  const weekHours = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.hours, 0),
    [chartData]
  );

  const weekProgress = useMemo(
    () => Math.min(100, Math.round((weekHours / 42.5) * 100)),
    [weekHours]
  );

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
    <div className="w-full min-h-screen xl:h-full flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto xl:overflow-hidden box-border bg-slate-50/50">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 sm:gap-6 overflow-visible xl:overflow-hidden">
        
        {/* TOP SECTION: Clock-In & Completion */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 shrink-0">
          {/* Shift Details & Clock-in Widget */}
          <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Clock16Regular className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Today's Shift</h2>
                    <p className="text-[11px] text-slate-500">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {todayRecord?.status && renderStatusBadge(todayRecord.status)}
              </div>

              {/* Shift Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Check In Time</span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    {todayRecord?.clockInTime
                      ? new Date(todayRecord.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Check Out Time</span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    {todayRecord?.clockOutTime
                      ? new Date(todayRecord.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Shift Timings</span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    09:00 AM - 06:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <ClockInWidget />
            </div>
          </div>

          {/* Hours Completion Progress */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Hours Completion
            </h3>

            <div className="space-y-3.5 my-auto">
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-600">This Week ({weekHours.toFixed(1)}/42.5h)</span>
                  <span className="text-blue-600 font-bold">{weekProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${weekProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-600">This Month ({stats.totalHoursWorked.toFixed(1)}/187h)</span>
                  <span className="text-emerald-600 font-bold">{monthProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${monthProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">Days Attended</span>
                <span className="text-sm font-bold text-slate-900">
                  {stats.presence} <span className="text-xs text-slate-400 font-normal">/ 22 Days</span>
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {Math.round((stats.presence / 22) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Responsive Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Presence</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">{stats.presence}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Absent</span>
            <p className="text-lg sm:text-xl font-bold text-rose-600 mt-0.5">{stats.absent}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Leave Taken</span>
            <p className="text-lg sm:text-xl font-bold text-purple-600 mt-0.5">{stats.leaveTaken}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">On Time</span>
            <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">{stats.onTime}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Late</span>
            <p className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5">{stats.late}</p>
          </div>
        </div>

        {/* BOTTOM SECTION: Working Hours Chart & Leave History */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Working Hours</h3>
                <p className="text-[11px] text-slate-500">Last 7 working days overview</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block" /> Full Hours
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Short Hours
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 w-full h-52 sm:h-64 lg:h-full min-h-[200px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No working hours logged yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 12]} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                      formatter={(value: any) => [`${value} hrs`, 'Worked']}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={22}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isShort ? '#f59e0b' : '#2563eb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Leave History Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-sm font-bold text-slate-900">Leave History</h3>
              <Button appearance="subtle" size="small" icon={<ArrowRight16Regular />} iconPosition="after">
                View All
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {isLeavesLoading ? (
                <div className="py-6 flex justify-center">
                  <Spinner size="small" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No leave applications found.
                </div>
              ) : (
                leaves.slice(0, 3).map((leave, idx) => (
                  <div key={leave.id ?? idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {leave.type || leave.leaveType || 'Casual Leave'}
                      </span>
                      <Badge
                        appearance="tint"
                        size="small"
                        color={
                          leave.status?.toUpperCase() === 'APPROVED'
                            ? 'success'
                            : leave.status?.toUpperCase() === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {leave.status ?? 'PENDING'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {leave.reason || 'No description provided'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: 30-DAY ATTENDANCE LOG */}
      <div className="w-full xl:w-80 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm shrink-0 flex flex-col h-auto xl:h-full max-h-[400px] xl:max-h-none min-h-0 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar20Regular className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Attendance Log</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">30 Days</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {isAttendanceLoading ? (
            <div className="py-8 flex justify-center">
              <Spinner size="small" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent attendance logs.
            </div>
          ) : (
            records.map((rec, idx) => {
              const dateObj = new Date(rec.date);
              const formattedDate = isNaN(dateObj.getTime())
                ? rec.date
                : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div key={rec.id ?? idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">{formattedDate}</span>
                    {renderStatusBadge(rec.status)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <CheckmarkCircle20Filled className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                      <span>
                        {rec.clockInTime
                          ? new Date(rec.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </span>
                    </div>
                    <span>-</span>
                    <div>
                      <span>
                        {rec.clockOutTime
                          ? new Date(rec.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}