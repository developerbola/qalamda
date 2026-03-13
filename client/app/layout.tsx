import { cookies } from "next/headers";
import ClientLayout from "./ClientLayout";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isInitiallyAuth = cookieStore.get("qalamda_auth_status")?.value === "authenticated";
  const initialUsername = cookieStore.get("qalamda_username")?.value;

  return (
    <ClientLayout isInitiallyAuth={isInitiallyAuth} initialUsername={initialUsername}>
      {children}
    </ClientLayout>
  );
}
