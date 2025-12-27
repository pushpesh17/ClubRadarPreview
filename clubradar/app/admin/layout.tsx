import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-auth";

// Force dynamic rendering - admin routes require authentication checks
export const dynamic = 'force-dynamic';

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

