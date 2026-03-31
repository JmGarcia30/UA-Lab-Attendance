"use client";

import { useState, useEffect } from "react";
import { getAdminData, resetStudentDevice, loginAdmin, registerAdmin } from "../actions";
import { AttendanceLog, Student, Schedule } from "./types";
import AttendanceTab from "./components/AttendanceTab";
import SchedulesTab from "./components/SchedulesTab";
import DevicesTab from "./components/DevicesTab";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  
  const [adminId, setAdminId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const [activeTab, setActiveTab] = useState<"attendance" | "schedules" | "devices">("attendance");

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  async function fetchDashboardData() {
    const data = await getAdminData();
    if (data.success) {
      setLogs(data.logs || []);
      setStudents(data.students || []);
      setSchedules(data.schedules || []);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (isRegistering) {
        // Now only sending adminId and password
        const response = await registerAdmin(adminId, password);
        if (response.success) {
          setMessageType("success");
          setMessage("Registration successful! You can now log in.");
          setIsRegistering(false); 
          setPassword(""); 
        } else {
          setMessageType("error");
          setMessage(response.message);
        }
      } else {
        const response = await loginAdmin(adminId, password);
        if (response.success) {
          setIsAuthenticated(true);
        } else {
          setMessageType("error");
          setMessage(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetDevice(targetStudentId: string) {
    if (confirm(`Are you certain you want to reset the device for Student ID: ${targetStudentId}?`)) {
      setIsLoading(true);
      const response = await resetStudentDevice(targetStudentId);
      if (response.success) {
        alert("Device reset successfully.");
        fetchDashboardData();
      } else {
        alert("Failed to reset device.");
      }
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 w-full max-w-md relative">
          <a href="/" className="absolute top-8 left-8 text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors">Back to Home</a>
          
          <div className="text-center mb-8 mt-6">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isRegistering ? "Register Admin" : "Admin Login"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isRegistering ? "Create a new administrator account." : "Enter your credentials to access the dashboard."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin ID</label>
              <input 
                type="text" 
                placeholder="e.g. admin-01" 
                className="w-full px-4 py-3 rounded-md bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 focus:bg-white transition-colors" 
                value={adminId} 
                onChange={(e) => setAdminId(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                className="w-full px-4 py-3 rounded-md bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 focus:bg-white transition-colors" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-md mt-4 transition-colors">
              {isLoading ? "Processing..." : isRegistering ? "Create Account" : "Secure Login"}
            </button>
          </form>

          {message && (
            <p className={`mt-6 text-center text-sm font-medium ${messageType === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {message}
            </p>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage("");
              }} 
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              {isRegistering ? "Already have an account? Log in here." : "Need an admin account? Register here."}
            </button>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 pt-8 pb-4 px-8 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Administrator Control Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Logged in as: <span className="font-semibold">{adminId}</span></p>
          </div>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword(""); 
            }} 
            className="text-sm bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-md hover:bg-slate-200 transition-colors"
          >
            Log Out
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-8 flex space-x-8">
          <button onClick={() => setActiveTab("attendance")} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "attendance" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Attendance Records</button>
          <button onClick={() => setActiveTab("schedules")} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "schedules" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}>System Schedules</button>
          <button onClick={() => setActiveTab("devices")} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "devices" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Device Management</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8">
        {activeTab === "attendance" && <AttendanceTab logs={logs} />}
        {activeTab === "schedules" && <SchedulesTab schedules={schedules} refreshData={fetchDashboardData} />}
        {activeTab === "devices" && <DevicesTab students={students} onResetDevice={handleResetDevice} isLoading={isLoading} />}
      </div>
    </main>
  );
}