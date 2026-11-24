import { DataProvider } from "@/components/DataProvider";
import DashboardShell from "@/components/DashboardShell";
import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({ children }) {
  return (
    <DataProvider>
      <RequireAuth>
        <DashboardShell>{children}</DashboardShell>
      </RequireAuth>
    </DataProvider>
  );
}