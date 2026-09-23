import React from 'react';
import { Button } from '@fluentui/react-components';
import { ArrowLeft20Regular, Print20Regular } from '@fluentui/react-icons';

export interface PayslipItem {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  position?: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface PayslipViewProps {
  payslip: PayslipItem;
  onBack: () => void;
}

export function PayslipView({ payslip, onBack }: PayslipViewProps) {
  const monthName = MONTH_NAMES[(payslip.month || 1) - 1] || `Month ${payslip.month}`;
  const periodText = `${monthName} ${payslip.year}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 print:hidden">
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onBack}
          className="!text-slate-600 hover:!bg-slate-200/60 !rounded-sm"
        >
          Back to List
        </Button>
      </div>

      {/* Payslip Document Card */}
      <div
        id="printable-payslip"
        className="w-full max-w-xl bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col gap-6 print:border-none print:shadow-none print:p-0 print:w-full print:max-w-none"
      >
        {/* Document Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
            PAYSLIP
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">{periodText}</p>
        </div>

        <hr className="border-slate-100" />

        {/* Employee & Period Information Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              EMPLOYEE NAME
            </span>
            <p className="font-bold text-slate-900 text-base">
              {payslip.employeeName || 'James Thomas'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              POSITION
            </span>
            <p className="font-bold text-slate-900 text-base">
              {payslip.position || 'Marketing'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              EMAIL
            </span>
            <p className="font-bold text-slate-900 text-base break-all">
              {payslip.employeeEmail || payslip.employeeId || 'tem1@gmail.com'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              PERIOD
            </span>
            <p className="font-bold text-slate-900 text-base">{periodText}</p>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <div className="w-full rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>DESCRIPTION</span>
            <span>AMOUNT</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 text-sm font-semibold text-slate-700 bg-white">
            <div className="flex justify-between items-center px-6 py-3.5">
              <span>Basic Salary</span>
              <span className="text-slate-900">${payslip.basicSalary?.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5">
              <span>Allowances</span>
              <span className="text-slate-900">+${payslip.allowances?.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5">
              <span>Deductions</span>
              <span className="text-slate-900">-${payslip.deductions?.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center px-6 py-4 bg-slate-50/80 border-t border-slate-200 text-base font-bold text-slate-900">
            <span>Net Salary</span>
            <span className="text-lg">${payslip.netSalary?.toLocaleString()}</span>
          </div>
        </div>

        {/* Print Button - Hidden on Print */}
        <div className="flex justify-center pt-2 print:hidden">
          <Button
            appearance="primary"
            icon={<Print20Regular />}
            onClick={handlePrint}
            className="!rounded-md !bg-blue-600 hover:!bg-blue-700 !px-8 !py-4 !text-sm !font-semibold shadow-sm transition-all"
          >
            Print Payslip
          </Button>
        </div>
      </div>

      {/* CSS Rule to hide everything except the payslip document during print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}