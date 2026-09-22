import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
} from '@fluentui/react-components';
import { Department, type EmployeeDto, type UpsertEmployeeCommand } from '../../../api/generated/model';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: UpsertEmployeeCommand) => void;
  initialData: EmployeeDto | null;
  isLoading: boolean;
}

export function EmployeeModal({ isOpen, onClose, onSubmit, initialData, isLoading }: EmployeeModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>(Department.Engineering);
  const [salary, setSalary] = useState<number>(50000);
  const [dateOfJoining, setDateOfJoining] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName ?? '');
      setLastName(initialData.lastName ?? '');
      setEmail(initialData.email ?? '');
      setJobTitle(initialData.jobTitle ?? '');
      setDepartment((initialData.department as Department) ?? Department.Engineering);
      setSalary(initialData.salary ?? 50000);
      setDateOfJoining(
        initialData.dateOfJoining
          ? new Date(initialData.dateOfJoining).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setJobTitle('');
      setDepartment(Department.Engineering);
      setSalary(50000);
      setDateOfJoining(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      firstName,
      lastName,
      email,
      jobTitle,
      department,
      salary: Number(salary),
      dateOfJoining: new Date(dateOfJoining).toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="!rounded-md !p-6 max-w-lg w-full bg-white border border-slate-200">
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle className="text-slate-900 font-semibold text-lg border-b border-slate-200 pb-3 mb-4">
              {initialData ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            
            <DialogContent className="grid grid-cols-2 gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">First Name</Label>
                <Input value={firstName} onChange={(_, d) => setFirstName(d.value)} required className="!rounded-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">Last Name</Label>
                <Input value={lastName} onChange={(_, d) => setLastName(d.value)} required className="!rounded-sm" />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">Work Email</Label>
                <Input type="email" value={email} onChange={(_, d) => setEmail(d.value)} required className="!rounded-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Job Title</Label>
                <Input value={jobTitle} onChange={(_, d) => setJobTitle(d.value)} className="!rounded-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">Department</Label>
                <select
                  className="h-8 px-3 rounded-sm border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                >
                  {Object.values(Department).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">Salary</Label>
                <Input
                  type="number"
                  min="1"
                  value={salary.toString()}
                  onChange={(_, d) => setSalary(Number(d.value))}
                  required
                  className="!rounded-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label required className="text-xs font-semibold uppercase tracking-wider text-slate-600">Date of Joining</Label>
                <Input
                  type="date"
                  value={dateOfJoining}
                  onChange={(_, d) => setDateOfJoining(d.value)}
                  required
                  className="!rounded-sm"
                />
              </div>
            </DialogContent>

            <DialogActions className="pt-4 mt-4 border-t border-slate-200">
              <Button appearance="secondary" onClick={onClose} disabled={isLoading} className="!rounded-sm">
                Cancel
              </Button>
              <Button appearance="primary" type="submit" disabled={isLoading} className="!rounded-sm !bg-blue-600 hover:!bg-blue-700">
                {isLoading ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}