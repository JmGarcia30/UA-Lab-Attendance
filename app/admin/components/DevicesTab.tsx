"use client";

import { useState } from "react";
import { Student } from "../types";

interface DevicesTabProps {
  students: Student[];
  onResetDevice: (studentId: string) => void;
  isLoading: boolean;
}

export default function DevicesTab({ students, onResetDevice, isLoading }: DevicesTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [decryptedKeys, setDecryptedKeys] = useState<Set<string>>(new Set());
  
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(students.length / itemsPerPage));
  const paginatedDevices = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleDecryption = (studentId: string) => {
    setDecryptedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  return (
    <div className="animate-in fade-in duration-300 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Registered Endpoints</h2>
        <p className="text-sm text-slate-500 mt-1">Manage physical device access and view ECC Public Keys.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200 whitespace-nowrap">Student Identifier</th>
              <th className="p-4 font-semibold border-b border-slate-200 whitespace-nowrap w-1/2">Full Name</th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right whitespace-nowrap">Security Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {paginatedDevices.map((student) => {
              const isDecrypted = decryptedKeys.has(student.student_id);
              const hasKey = student.public_key && student.public_key.length > 0;

              return (
                <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Default State: Show the Key, Hide the Identity */}
                  {!isDecrypted && hasKey ? (
                    <td colSpan={2} className="p-4">
                      <div className="bg-slate-800 p-3 rounded-md text-xs font-mono text-emerald-400 break-all border border-slate-900 shadow-inner">
                        <span className="font-bold text-slate-400 mr-2 select-none"></span>
                        {student.public_key}
                      </div>
                    </td>
                  ) : (
                    /* Decrypted State: Reveal the Student ID and Name */
                    <>
                      <td className="p-4 font-medium text-slate-900 whitespace-nowrap align-middle">
                        {student.student_id}
                      </td>
                      <td className="p-4 whitespace-nowrap align-middle">
                        <span className="align-middle">{student.first_name} {student.last_name}</span>
                        {!hasKey && (
                          <span className="ml-3 align-middle text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded tracking-wide">REVOKED / PENDING</span>
                        )}
                      </td>
                    </>
                  )}

                  <td className="p-4 text-right space-x-2 whitespace-nowrap align-middle">
                    {hasKey && (
                      <button 
                        onClick={() => toggleDecryption(student.student_id)} 
                        className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-md hover:bg-slate-200 hover:text-slate-900 font-medium transition-colors"
                      >
                        {isDecrypted ? "Lock Data" : "Decrypt"}
                      </button>
                    )}
                    <button 
                      onClick={() => onResetDevice(student.student_id)} 
                      disabled={isLoading || !hasKey} 
                      className="text-xs bg-white border border-rose-200 text-rose-600 px-3 py-2 rounded-md hover:bg-rose-50 font-medium transition-colors disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"
                    >
                      Revoke Device
                    </button>
                  </td>
                </tr>
              );
            })}
            {paginatedDevices.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  No devices are currently registered in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {students.length > 0 && (
        <div className="flex justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-700 self-center">Page <span className="font-semibold">{currentPage}</span> of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}