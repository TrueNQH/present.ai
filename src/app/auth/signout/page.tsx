"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleSignOut = async () => {
    await signOut({ callbackUrl });
  };

  const handleCancel = () => {
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-4">
            <Button onClick={handleSignOut}>Yes, sign me out</Button>
            <Button variant="outline" onClick={handleCancel}>
              No, take me back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
