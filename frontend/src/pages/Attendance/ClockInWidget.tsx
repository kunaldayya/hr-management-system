import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Badge,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Textarea,
} from '@fluentui/react-components';
import { Play20Filled, Square20Filled } from '@fluentui/react-icons';

import {
  useGetApiAttendanceTodayStatus,
  usePostApiAttendanceClockIn,
  usePostApiAttendanceClockOut,
} from '../../api/generated/attendance/attendance';

export function ClockInWidget() {
  const [now, setNow] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [modalType, setModalType] = useState<'clock-in' | 'clock-out' | null>(null);

  // Live ticker for active elapsed time calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: todayStatusResponse,
    isLoading,
    refetch,
  } = useGetApiAttendanceTodayStatus();

  const statusData = (todayStatusResponse as any)?.data ?? todayStatusResponse;

  const clockInMutation = usePostApiAttendanceClockIn();
  const clockOutMutation = usePostApiAttendanceClockOut();

  const isClockedIn = statusData?.isClockedIn ?? false;
  
  // Safely parse date objects for calculation
  const clockInDate = statusData?.clockInTime ? new Date(statusData.clockInTime) : null;
  const clockOutDate = statusData?.clockOutTime ? new Date(statusData.clockOutTime) : null;

  const clockInTime = clockInDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clockOutTime = clockOutDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 9-Hour Shift Limit Calculation
  const SHIFT_LIMIT_MS = 9 * 60 * 60 * 1000; // 9 Hours

  let elapsedMs = 0;
  if (clockInDate) {
    const endTime = clockOutDate ? clockOutDate.getTime() : now.getTime();
    elapsedMs = Math.max(0, endTime - clockInDate.getTime());
  }

  const shiftProgress = Math.min(100, (elapsedMs / SHIFT_LIMIT_MS) * 100);

  // Format elapsed time (HH:MM:SS)
  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // SVG Circle Math for Progress Ring
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (shiftProgress / 100) * circumference;

  const handleAction = () => {
    const mutation = modalType === 'clock-in' ? clockInMutation : clockOutMutation;
    mutation.mutate(
      { data: { notes } },
      {
        onSuccess: () => {
          setModalType(null);
          setNotes('');
          refetch();
        },
      }
    );
  };

  const isPending = clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <Card className="w-full bg-white border-none shadow-none flex flex-col md:flex-row items-center gap-8 py-2">
      
      {/* 9-Hour Royal Blue Circular Progress Clock */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width="140" height="140" className="transform -rotate-90 drop-shadow-sm">
          {/* Background Empty Ring Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Royal Blue Dynamic Fill Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-blue-600 transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Elapsed Timer Display (Inside Ring) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-xl font-black text-slate-900 tracking-tight leading-none font-mono">
            {formatTimer(elapsedMs)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
            / 9.0 hrs
          </span>
        </div>
      </div>

      {/* Status & Action Buttons */}
      <div className="flex-1 flex flex-col items-center md:items-start w-full">
        <div className="mb-4 text-center md:text-left flex items-center gap-3">
          {isLoading ? (
            <Spinner size="tiny" />
          ) : isClockedIn ? (
            <Badge appearance="filled" color="success" size="large" className="!px-3 !py-1">
              CLOCKED IN ({clockInTime})
            </Badge>
          ) : clockOutTime ? (
            <Badge appearance="filled" color="important" size="large" className="!px-3 !py-1">
              SHIFT COMPLETED ({clockOutTime})
            </Badge>
          ) : (
            <Badge appearance="tint" color="informative" size="large" className="!px-3 !py-1">
              NOT CLOCKED IN
            </Badge>
          )}
        </div>

        <div className="w-full sm:w-auto">
          {!isClockedIn ? (
            <Button
              appearance="primary"
              size="large"
              icon={<Play20Filled />}
              disabled={isLoading || !!clockOutTime}
              onClick={() => setModalType('clock-in')}
              className="w-full md:w-[200px] !bg-blue-600 hover:!bg-blue-700 !rounded-lg font-bold shadow-sm text-white"
            >
              Clock In
            </Button>
          ) : (
            <Button
              appearance="primary"
              size="large"
              icon={<Square20Filled />}
              disabled={isLoading}
              onClick={() => setModalType('clock-out')}
              className="w-full md:w-[200px] !bg-rose-600 hover:!bg-rose-700 !rounded-lg font-bold shadow-sm text-white"
            >
              Clock Out
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation & Notes Dialog */}
      <Dialog open={modalType !== null} onOpenChange={(_, d) => !d.open && setModalType(null)}>
        <DialogSurface className="!rounded-2xl !p-6 max-w-md w-full">
          <DialogBody>
            <DialogTitle className="text-slate-900 font-bold text-xl border-b border-slate-100 pb-4 mb-4">
              {modalType === 'clock-in' ? 'Clock In Confirmation' : 'Clock Out Confirmation'}
            </DialogTitle>
            <DialogContent className="flex flex-col gap-4 py-2">
              <p className="text-sm text-slate-600">
                Are you sure you want to {modalType === 'clock-in' ? 'clock in' : 'clock out'} at{' '}
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>?
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={modalType === 'clock-in' ? 'e.g. Working remotely' : 'e.g. Completed daily tasks'}
                  className="!rounded-xl min-h-[100px]"
                />
              </div>
            </DialogContent>
            <DialogActions className="pt-6 mt-4 border-t border-slate-100">
              <Button appearance="subtle" onClick={() => setModalType(null)} disabled={isPending} className="!rounded-lg font-semibold text-slate-500">
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleAction}
                disabled={isPending}
                className={`!rounded-lg font-bold ${modalType === 'clock-in' ? '!bg-blue-600 hover:!bg-blue-700' : '!bg-rose-600 hover:!bg-rose-700'}`}
              >
                {isPending ? 'Processing...' : modalType === 'clock-in' ? 'Confirm Clock In' : 'Confirm Clock Out'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}