import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@fluentui/react-components';

import {
  usePostApiEmployeesUpsert,
  getGetApiEmployeesQueryKey,
} from '../../api/generated/employees/employees';
import type { EmployeeDto, UpsertEmployeeCommand } from '../../api/generated/model';
import { EmployeeTable } from '../../features/employees/components/EmployeeTable';
import { EmployeeModal } from '../../features/employees/components/EmployeeModal';

export function EmployeesPage() {
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
    <div className="w-full flex flex-col gap-6 p-6 p-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage employee details, roles, and departmental assignments.
          </p>
        </div>

        <Button
          appearance="primary"
          onClick={handleCreateOpen}
          className="!rounded-sm !bg-blue-600 hover:!bg-blue-700 shadow-sm"
        >
          + Add Employee
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="w-full min-w-0">
        <EmployeeTable onEdit={handleEditOpen} />

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