import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="pt-24 pb-12">
        {children}
      </main>
      <footer className="py-8 border-t border-border text-center text-slate-500 text-sm">
        <p>&copy; 2024 LuxBank International. All rights reserved.</p>
      </footer>
    </div>
  );
}
