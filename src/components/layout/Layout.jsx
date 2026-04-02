import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* main con margen izquierdo (ml-64) para no quedar debajo del sidebar */}
      <main className="flex-1 ml-64 p-8 transition-all min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;