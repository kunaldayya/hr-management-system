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
  makeStyles,
} from '@fluentui/react-components';
import { Department, type EmployeeDto, type UpsertEmployeeCommand } from '../../../api/generated/model';

const useStyles = makeStyles({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  select: {
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    height: '32px',
  },
});

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: UpsertEmployeeCommand) => void;
  initialData: EmployeeDto | null;
  isLoading: boolean;
}

export function EmployeeModal({ isOpen, onClose, onSubmit, initialData, isLoading }: EmployeeModalProps) {
  const styles = useStyles();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>(Department.NUMBER_1);
  const [salary, setSalary] = useState<number>(50000);
  const [dateOfJoining, setDateOfJoining] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName ?? '');
      setLastName(initialData.lastName ?? '');
      setEmail(initialData.email ?? '');
      setJobTitle(initialData.jobTitle ?? '');
      setDepartment((initialData.department as Department) ?? Department.NUMBER_1);
      setSalary((initialData as any).salary ?? 50000);
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
      setDepartment(Department.NUMBER_1);
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
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>{initialData ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogContent>
              <div className={styles.field}>
                <Label required>First Name</Label>
                <Input value={firstName} onChange={(_, d) => setFirstName(d.value)} required />
              </div>
              <div className={styles.field}>
                <Label required>Last Name</Label>
                <Input value={lastName} onChange={(_, d) => setLastName(d.value)} required />
              </div>
              <div className={styles.field}>
                <Label required>Work Email</Label>
                <Input type="email" value={email} onChange={(_, d) => setEmail(d.value)} required />
              </div>
              <div className={styles.field}>
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={(_, d) => setJobTitle(d.value)} />
              </div>
              <div className={styles.field}>
                <Label required>Department</Label>
                <select
                  className={styles.select}
                  value={department}
                  onChange={(e) => setDepartment(Number(e.target.value) as Department)}
                >
                  <option value={Department.NUMBER_1}>Engineering</option>
                  <option value={Department.NUMBER_2}>Human Resources</option>
                  <option value={Department.NUMBER_3}>Finance</option>
                  <option value={Department.NUMBER_4}>Marketing</option>
                  <option value={Department.NUMBER_5}>Sales</option>
                  <option value={Department.NUMBER_6}>Operations</option>
                </select>
              </div>
              <div className={styles.field}>
                <Label required>Salary</Label>
                <Input
                  type="number"
                  min="1"
                  value={salary.toString()}
                  onChange={(_, d) => setSalary(Number(d.value))}
                  required
                />
              </div>
              <div className={styles.field}>
                <Label required>Date of Joining</Label>
                <Input
                  type="date"
                  value={dateOfJoining}
                  onChange={(_, d) => setDateOfJoining(d.value)}
                  required
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button appearance="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}