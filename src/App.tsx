import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BmsSessionProvider } from '@/contexts/BmsSessionContext'
import { SessionValidator } from '@/components/session/SessionValidator'
import { LoadingSpinner } from '@/components/layout/LoadingSpinner'
import { AppLayout } from '@/components/layout/AppLayout'

// ใช้ lazy import เพื่อให้โหลดเฉพาะหน้าที่เรียกใช้
const Overview = lazy(() => import('@/pages/Overview'))
const Trends = lazy(() => import('@/pages/Trends'))
const DepartmentAnalytics = lazy(() => import('@/pages/DepartmentAnalytics'))
const Demographics = lazy(() => import('@/pages/Demographics'))
const SpecialReport = lazy(() => import('@/pages/SpecialReport')) 

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message="กำลังโหลดหน้า..." className="min-h-[50vh]" />}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/departments" element={<DepartmentAnalytics />} />
        <Route path="/demographics" element={<Demographics />} />
        
        {/* เส้นทางสำหรับหน้าใหม่ */}
        <Route path="/special-report" element={<SpecialReport />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BmsSessionProvider>
        {/* ปิดการใช้งาน SessionValidator ชั่วคราวเพื่อให้เข้าหน้า Dashboard ได้ทันที 
            โดยใช้การครอบด้วย { / * ... * / } แทนการใช้ //
        */}
        <SessionValidator>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </SessionValidator>
      </BmsSessionProvider>
    </BrowserRouter>
  )
}