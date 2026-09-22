import { useState } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Label,
  makeStyles,
} from '@fluentui/react-components';

// Import exact generated hooks
import {
  useGetApiPayslipsMyPayslips,
  usePostApiPayslipsGenerate,
} from '../api/generated/payslips/payslips';

const useStyles = makeStyles({
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' },
});

export function PayslipManagement({ isAdmin }: { isAdmin: boolean }) {
  const styles = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState(50000);
  const [allowances, setAllowances] = useState(5000);
  const [deductions, setDeductions] = useState(2000);

  // Orval Hooks
  const { data: payslipsResponse, refetch, isLoading } = useGetApiPayslipsMyPayslips();
  const generatePayslipMutation = usePostApiPayslipsGenerate();

  // Extract array from nested API response wrapper
  const payslips = payslipsResponse?.data?.data ?? [];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generatePayslipMutation.mutate(
      {
        data: {
          employeeId,
          month: Number(month),
          year: Number(year),
          basicSalary: Number(basicSalary),
          allowances: Number(allowances),
          deductions: Number(deductions),
        },
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          refetch();
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Payslip Management</h2>
        {isAdmin && (
          <Button appearance="primary" onClick={() => setIsModalOpen(true)}>
            Generate Payslip
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Employee</TableHeaderCell>
            <TableHeaderCell>Period</TableHeaderCell>
            <TableHeaderCell>Basic Salary</TableHeaderCell>
            <TableHeaderCell>Allowances</TableHeaderCell>
            <TableHeaderCell>Deductions</TableHeaderCell>
            <TableHeaderCell>Net Salary</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>Loading...</TableCell>
            </TableRow>
          ) : (
            payslips.map((p, index) => {
              const employeeName = (p as Record<string, unknown>).employeeName as string | undefined;

              return (
                <TableRow key={p.id ?? index}>
                  <TableCell>{employeeName ?? p.employeeId ?? 'N/A'}</TableCell>
                  <TableCell>{p.month}/{p.year}</TableCell>
                  <TableCell>${p.basicSalary}</TableCell>
                  <TableCell>${p.allowances}</TableCell>
                  <TableCell>${p.deductions}</TableCell>
                  <TableCell>
                    <strong>${p.netSalary}</strong>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => window.print()}>
                      Print / PDF
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Generate Payslip Modal */}
      <Dialog open={isModalOpen} onOpenChange={(_, d) => !d.open && setIsModalOpen(false)}>
        <DialogSurface>
          <form onSubmit={handleGenerate}>
            <DialogBody>
              <DialogTitle>Generate Payslip</DialogTitle>
              <DialogContent>
                <div className={styles.field}>
                  <Label required>Employee ID</Label>
                  <Input
                    value={employeeId}
                    onChange={(_, d) => setEmployeeId(d.value)}
                    placeholder="Enter Employee ID"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <Label required>Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={month.toString()}
                    onChange={(_, d) => setMonth(Number(d.value))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <Label required>Year</Label>
                  <Input
                    type="number"
                    value={year.toString()}
                    onChange={(_, d) => setYear(Number(d.value))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <Label required>Basic Salary</Label>
                  <Input
                    type="number"
                    value={basicSalary.toString()}
                    onChange={(_, d) => setBasicSalary(Number(d.value))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <Label required>Allowances</Label>
                  <Input
                    type="number"
                    value={allowances.toString()}
                    onChange={(_, d) => setAllowances(Number(d.value))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <Label required>Deductions</Label>
                  <Input
                    type="number"
                    value={deductions.toString()}
                    onChange={(_, d) => setDeductions(Number(d.value))}
                    required
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" type="submit" disabled={generatePayslipMutation.isPending}>
                  Generate
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  );
}