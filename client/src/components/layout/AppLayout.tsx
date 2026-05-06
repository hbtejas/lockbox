import { Outlet } from 'react-router-dom'
import { useRealtimeBridge } from '../../hooks/useRealtimeBridge'
import Footer from './Footer'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppLayout() {
  useRealtimeBridge(true)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 w-full relative">
          <div className="mx-auto max-w-[1400px] p-4 md:p-8">
            <Outlet />
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
