import { useState, useCallback, useMemo } from 'react';
import { useBmsSessionContext } from '@/contexts/BmsSessionContext';
import { useQuery } from '@/hooks/useQuery';
import { getDateRange } from '@/utils/dateUtils';
// 🌟 นำเข้า DateRangePicker ของระบบเดิม
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
// 🌟 นำเข้าฟังก์ชันที่เราเพิ่มในขั้นตอนที่ 1
import { getMissingAuthCases } from '@/services/kpiService'; 

import { UserX, CheckCircle2, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- ฟังก์ชันจัดการวันที่ให้แสดงผลสวยงาม ---
const formatThaiDate = (dateStr: string) => {
  if (!dateStr || dateStr === "0000-00-00") return "-";
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export default function SpecialReport() {
  // 🌟 ดึง Context การเชื่อมต่อ DB มาใช้งาน (เหมือนหน้า Demographics)
  const { connectionConfig, session } = useBmsSessionContext();

  const defaultRange = useMemo(() => getDateRange(30), []);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const isConnected = connectionConfig !== null && session !== null;

  // 🌟 ฟังก์ชันเตรียมข้อมูลส่งไป kpiService
  const missingAuthQueryFn = useCallback(
    () =>
      getMissingAuthCases(
        connectionConfig!,
        session!.databaseType,
        startDate,
        endDate,
      ),
    [connectionConfig, session, startDate, endDate],
  );

  // 🌟 ใช้ useQuery ดึงข้อมูล
  const missingAuthQuery = useQuery<any[]>({
    queryFn: missingAuthQueryFn,
    enabled: isConnected,
  });

  const handleRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  // --- จัดการข้อมูลที่ดึงมาได้ ---
  const displayData = missingAuthQuery.data ?? [];
  const isLoading = missingAuthQuery.isLoading;

  const totalCases = displayData.length;
  // กรองคนที่ไม่มี Auth 
  const missingAuthTableData = displayData.filter(item => !item.auth || item.auth.trim() === '');
  const missingAuthCount = missingAuthTableData.length;
  const completeAuthCount = totalCases - missingAuthCount;

  const chartData = [
    { name: 'สิทธิครบ', count: completeAuthCount, fill: '#10b981' },
    { name: 'สิทธิว่าง', count: missingAuthCount, fill: '#f43f5e' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. ส่วนหัวและปุ่มเลือกวันที่ (ใช้ DateRangePicker ของระบบ) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ตรวจสอบเลข Auth Code ว่าง
          </h1>
          <p className="text-sm text-muted-foreground">
            รายชื่อผู้มารับบริการที่ไม่ได้ลงข้อมูลสิทธิการรักษา
          </p>
        </div>
        
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
          isLoading={isLoading}
        />
      </div>

      {/* 2. การ์ดสรุปยอด */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">เคสทั้งหมดในช่วงที่เลือก</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCases} ราย</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">ลงข้อมูลครบ</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{completeAuthCount} ราย</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">เลข Auth ว่าง</p>
            <UserX className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{missingAuthCount} ราย</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* 3. กราฟ */}
        <div className="md:col-span-3 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-6">สัดส่วนข้อมูล</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. ตารางแสดงเฉพาะคนสิทธิว่าง */}
        <div className="md:col-span-4 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-rose-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-rose-700 text-sm">รายชื่อผู้มารับบริการที่ต้องตาม Auth Code</h3>
            <span className="text-xs bg-white text-rose-600 px-2 py-1 rounded-full border border-rose-200 font-medium">
              พบ {missingAuthCount} รายการ
            </span>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3">HN / AN</th>
                  <th className="px-4 py-3">วันที่</th>
                  <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลจากฐานข้อมูล...</td></tr>
                ) : !isConnected ? (
                  <tr><td colSpan={4} className="p-8 text-center text-rose-500">ยังไม่ได้เชื่อมต่อฐานข้อมูล HOSxP</td></tr>
                ) : missingAuthTableData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800">{item.hn}</div>
                      <div className="text-[10px] text-slate-400">AN: {item.an}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatThaiDate(item.date)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{item.name}</td>
                    <td className="px-4 py-4 text-center">
                       <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs border border-rose-100 font-medium animate-pulse">
                         ไม่มี Auth
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!isLoading && isConnected && missingAuthCount === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-800 font-medium">ยอดเยี่ยมมาก!</p>
                  <p className="text-slate-500 text-sm">ไม่มีผู้มารับบริการที่สิทธิว่างในช่วงวันที่เลือก</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}