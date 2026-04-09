import { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  UserX, 
  CheckCircle2, 
  Users,
  Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- ฟังก์ชันจัดการวันที่ ---
const formatThaiDate = (dateStr: string) => {
  if (!dateStr || dateStr === "0000-00-00") return "-";
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const getTodayLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

const getFirstDayOfMonthLocal = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = firstDay.getTimezoneOffset() * 60000;
  return new Date(firstDay.getTime() - offset).toISOString().split('T')[0];
};

const SpecialReport = () => {
  const [startDate, setStartDate] = useState(getFirstDayOfMonthLocal());
  const [endDate, setEndDate] = useState(getTodayLocal());

  // 🌟 1. ฐานข้อมูลจำลอง (Mock Data) ใส่เคสวันที่ต่างกันเพื่อให้ลองค้นหาได้
  const ALL_MOCK_DATA = useMemo(() => [
    { hn: '670001', an: '6900001', date: '2026-03-01', name: 'นายสมชาย รักดี', auth: '' },
    { hn: '670045', an: '6900023', date: '2026-03-15', name: 'นางสาวใจดี มีสุข', auth: 'A12345' },
    { hn: '670089', an: '6900045', date: '2026-04-01', name: 'นายมานะ ขยัน', auth: '' },
    { hn: '670120', an: '6900060', date: '2026-04-05', name: 'นางวิไล พรพรรณ', auth: 'C77889' },
    { hn: '670155', an: '6900088', date: '2026-04-09', name: 'เด็กชายเก่ง กล้า', auth: '' },
    { hn: '670200', an: '6900100', date: '2026-04-12', name: 'นางสมศรี ใจสู้', auth: '' },
  ], []);

  // 🌟 2. ตัวแปรเก็บข้อมูลที่จะเอาไปแสดงจริงบนหน้าจอ
  const [displayData, setDisplayData] = useState(ALL_MOCK_DATA);

  // 🌟 3. ระบบค้นหา (กรองข้อมูลจากวันที่ ที่อยู่ใน MOCK_DATA)
  const handleSearch = () => {
    const filtered = ALL_MOCK_DATA.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    });
    setDisplayData(filtered);
  };

  // โหลดหน้าครั้งแรก ให้มันกรองตามวันที่เริ่มต้นเลย
  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. คำนวณภาพรวมสำหรับการ์ดและกราฟ (นับจาก displayData)
  const totalCases = displayData.length;
  const missingAuth = displayData.filter(item => !item.auth || item.auth.trim() === '').length;
  const completeAuth = totalCases - missingAuth;

  // 5. กรองข้อมูลเอาเฉพาะ "คนที่ Auth ว่าง" เพื่อส่งไปวาดในตาราง
  const missingAuthTableData = displayData.filter(item => !item.auth || item.auth.trim() === '');

  const chartData = [
    { name: 'สิทธิครบ', count: completeAuth, fill: '#10b981' },
    { name: 'สิทธิว่าง', count: missingAuth, fill: '#f43f5e' },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">ตรวจสอบเลข Auth Code ว่าง</h2>
          <p className="text-slate-500 font-medium">จัดการข้อมูลโรงพยาบาลบางไทร</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <div className="flex items-center gap-1">
             <input 
               type="date" 
               className="text-sm border-none focus:ring-0 p-1 cursor-pointer" 
               value={startDate} 
               onChange={(e) => setStartDate(e.target.value)} 
             />
             <span className="text-slate-400 text-xs">ถึง</span>
             <input 
               type="date" 
               className="text-sm border-none focus:ring-0 p-1 cursor-pointer" 
               value={endDate} 
               onChange={(e) => setEndDate(e.target.value)} 
             />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-1 transition-all active:scale-95"
          >
            <Search className="h-4 w-4" /> ค้นหา
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">เคสในช่วงที่เลือก</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCases} ราย</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">ลงข้อมูลครบ</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{completeAuth} ราย</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-600">เลข Auth ว่าง</p>
            <UserX className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{missingAuth} ราย</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
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

        <div className="md:col-span-4 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-rose-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-rose-700 text-sm">รายชื่อผู้มารับบริการที่ต้องตาม Auth Code</h3>
            <span className="text-xs bg-white text-rose-600 px-2 py-1 rounded-full border border-rose-200 font-medium">
              พบ {missingAuthTableData.length} รายการ
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
                {missingAuthTableData.map((item, idx) => (
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
            
            {missingAuthTableData.length === 0 && (
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
};

export default SpecialReport;