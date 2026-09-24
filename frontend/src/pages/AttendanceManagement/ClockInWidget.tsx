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
import {
  Clock20Regular,
  Play20Filled,
  Square20Filled,
} from '@fluentui/react-icons';

import {
  useGetApiAttendanceTodayStatus,
  usePostApiAttendanceClockIn,
  usePostApiAttendanceClockOut,
} from '../../api/generated/attendance/attendance';

export function ClockInWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [modalType, setModalType] = useState<'clock-in' | 'clock-out' | null>(null);

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  const {
    data: todayStatusResponse,
    isLoading,
    refetch,
  } = useGetApiAttendanceTodayStatus();

  const statusData = (todayStatusResponse as any)?.data ?? todayStatusResponse;

  // Mutations
  const clockInMutation = usePostApiAttendanceClockIn();
  const clockOutMutation = usePostApiAttendanceClockOut();

  const isClockedIn = statusData?.isClockedIn ?? false;
  const clockInTime = statusData?.clockInTime
    ? new Date(statusData.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const clockOutTime = statusData?.clockOutTime
    ? new Date(statusData.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleAction = () => {
    if (modalType === 'clock-in') {
      clockInMutation.mutate(
        { data: { notes } },
        {
          onSuccess: () => {
            setModalType(null);
            setNotes('');
            refetch();
          },
        }
      );
    } else if (modalType === 'clock-out') {
      clockOutMutation.mutate(
        { data: { notes } },
        {
          onSuccess: () => {
            setModalType(null);
            setNotes('');
            refetch();
          },
        }
      );
    }
  };

  const isPending = clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Clock20Regular className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            {isLoading ? (
              <Spinner size="tiny" />
            ) : isClockedIn ? (
              <Badge appearance="filled" color="success">
                CLOCKED IN ({clockInTime})
              </Badge>
            ) : clockOutTime ? (
              <Badge appearance="filled" color="important">
                SHIFT COMPLETED ({clockOutTime})
              </Badge>
            ) : (
              <Badge appearance="tint" color="informative">
                NOT CLOCKED IN
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isClockedIn ? (
          <Button
            appearance="primary"
            icon={<Play20Filled />}
            disabled={isLoading || !!clockOutTime}
            onClick={() => setModalType('clock-in')}
            className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 !rounded-sm font-semibold"
          >
            Clock In
          </Button>
        ) : (
          <Button
            appearance="primary"
            icon={<Square20Filled />}
            disabled={isLoading}
            onClick={() => setModalType('clock-out')}
            className="w-full sm:w-auto !bg-rose-600 hover:!bg-rose-700 !rounded-sm font-semibold"
          >
            Clock Out
          </Button>
        )}
      </div>

      {/* Confirmation & Notes Dialog */}
      <Dialog open={modalType !== null} onOpenChange={(_, d) => !d.open && setModalType(null)}>
        <DialogSurface className="!rounded-md !p-6 max-w-md w-full">
          <DialogBody>
            <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
              {modalType === 'clock-in' ? 'Clock In Confirmation' : 'Clock Out Confirmation'}
            </DialogTitle>
            <DialogContent className="flex flex-col gap-3 py-2">
              <p className="text-sm text-slate-600">
                Are you sure you want to {modalType === 'clock-in' ? 'clock in' : 'clock out'} at{' '}
                <span className="font-semibold text-slate-900">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                ?
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={modalType === 'clock-in' ? 'e.g. Working remotely' : 'e.g. Completed daily tasks'}
                  className="!rounded-sm"
                />
              </div>
            </DialogContent>
            <DialogActions className="pt-4 mt-4 border-t border-slate-200">
              <Button appearance="secondary" onClick={() => setModalType(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleAction}
                disabled={isPending}
                className={`!rounded-sm ${modalType === 'clock-in' ? '!bg-emerald-600 hover:!bg-emerald-700' : '!bg-rose-600 hover:!bg-rose-700'}`}
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