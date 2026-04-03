"use client";

import { useState } from "react";
import { Student } from "../types";

interface DevicesTabProps {
  students: Student[];
  onResetDevice: (studentId: string) => void;
  isLoading: boolean;
}

export default function DevicesTab({ students, onResetDevice, isLoading }: DevicesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [decryptedKeys, setDecryptedKeys] = useState<Set<string>>(new Set());

  // 1. Real-time filtering logic
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Handling potential naming variations from the database
   // 1. Inside your filteredStudents logic:
    const fName = student.first_name || "";
    const lName = student.last_name || "";
    const id = student.student_id || "";
    
    const fullName = `${fName} ${lName}`.toLowerCase();

    return (
      id.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  // 2. Pagination logic (applied AFTER filtering)
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  
  // Prevent being stuck on an empty page if search results shrink
  const validPage = Math.min(currentPage, totalPages);
  
  const paginatedDevices = filteredStudents.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

  // 3. Decryption toggle logic
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
    <div className="animate-in fade-in duration-500">
      
      {/* Search & Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#011B51] uppercase tracking-tight">Registered Endpoints</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage physical device access and view ECC Public Keys.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID or Name..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-medium focus:bg-white focus:border-[#011B51] focus:ring-2 focus:ring-[#011B51]/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-[#011B51] uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 whitespace-nowrap">Student Identifier</th>
                <th className="p-4 border-b border-slate-200 whitespace-nowrap w-1/2">Full Name</th>
                <th className="p-4 border-b border-slate-200 text-right whitespace-nowrap">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedDevices.map((student, index) => {
                const id = student.student_id || "";
                const fName = student.first_name || "";
                const lName = student.last_name || "";
                const publicKey = student.public_key || "";
                
                const isDecrypted = decryptedKeys.has(id);
                const hasKey = publicKey && publicKey.length > 0;

                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Default State: Show the Key, Hide the Identity */}
                    {!isDecrypted && hasKey ? (
                      <td colSpan={2} className="p-4">
                        <div className="bg-slate-900 p-3 rounded-xl text-xs font-mono text-emerald-400 break-all border border-slate-800 shadow-inner">
                          <span className="font-bold text-slate-500 mr-2 select-none">KEY:</span>
                          {publicKey}
                        </div>
                      </td>
                    ) : (
                      /* Decrypted State: Reveal the Student ID and Name */
                      <>
                        <td className="p-4 font-bold text-slate-900 whitespace-nowrap align-middle">
                          {id}
                        </td>
                        <td className="p-4 font-medium text-slate-600 whitespace-nowrap align-middle">
                          <span className="align-middle">{fName} {lName}</span>
                          {!hasKey && (
                            <span className="ml-3 align-middle text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-md tracking-wide uppercase">
                              Revoked
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    <td className="p-4 text-right space-x-2 whitespace-nowrap align-middle">
                      {hasKey && (
                        <button 
                          onClick={() => toggleDecryption(id)} 
                          className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 font-bold uppercase tracking-wide transition-all shadow-sm"
                        >
                          {isDecrypted ? "Lock Data" : "Decrypt"}
                        </button>
                      )}
                      <button 
                        onClick={() => onResetDevice(id)} 
                        disabled={isLoading || !hasKey} 
                        className="text-xs bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-lg hover:bg-rose-50 font-bold uppercase tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"
                      >
                        Revoke Device
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedDevices.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-500 font-medium">
                    {searchTerm ? "No students found matching your search." : "No devices are currently registered in the system."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={validPage === 1} 
              className="px-4 py-2 text-xs font-bold text-[#011B51] uppercase tracking-wide bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500 self-center">
              Page <span className="font-bold text-slate-900">{validPage}</span> of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={validPage === totalPages} 
              className="px-4 py-2 text-xs font-bold text-[#011B51] uppercase tracking-wide bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}