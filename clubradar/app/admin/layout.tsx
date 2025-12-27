import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access on server side
  const { isAdmin } = await checkAdminAccess();

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}

