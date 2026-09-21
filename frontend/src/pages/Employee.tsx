import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { makeStyles } from '@fluentui/react-components';

import {
  usePostApiEmployeesUpsert,
  getGetApiEmployeesQueryKey,
} from '../api/generated/employees/employees';
import type { EmployeeDto, UpsertEmployeeCommand } from '../api/generated/model';
import { EmployeeTable } from '../features/employees/components/EmployeeTable';
import { EmployeeModal } from '../features/employees/components/EmployeeModal';

const useStyles = makeStyles({
  layout: {
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '@media (max-width: 768px)': {
      padding: '12px',
      gap: '12px',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
    color: '#1a1a1a',
    '@media (max-width: 480px)': {
      fontSize: '20px',
    },
  },
});

export function EmployeesPage() {
  const styles = useStyles();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);

  const upsertMutation = usePostApiEmployeesUpsert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiEmployeesQueryKey() });
        setIsModalOpen(false);
        setSelectedEmployee(null);
      },
    },
  });

  const handleCreateOpen = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (emp: EmployeeDto) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (command: UpsertEmployeeCommand) => {
    upsertMutation.mutate({ data: command });
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Employee Management</h1>
      </header>

      <main style={{ width: '100%', minWidth: 0 }}>
        <EmployeeTable onAdd={handleCreateOpen} onEdit={handleEditOpen} />

        <EmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedEmployee}
          isLoading={upsertMutation.isPending}
        />
      </main>
    </div>
  );
}