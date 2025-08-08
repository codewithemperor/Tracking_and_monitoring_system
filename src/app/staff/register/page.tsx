"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield } from "lucide-react";

export default function StaffRegister() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to staff login after a short delay
    const timer = setTimeout(() => {
      router.push("/staff/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nipost-blue to-nipost-dark-blue p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-nipost-blue" />
          </div>
          <CardTitle className="text-2xl text-center text-nipost-blue">
            Staff Registration
          </CardTitle>
          <CardDescription className="text-center">
            Access Restricted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              Staff Registration is Disabled
            </p>
            <p className="text-muted-foreground">
              Only administrators can create new staff accounts. Please contact your system administrator to get a staff account created for you.
            </p>
          </div>

          <div className="text-center space-y-3">
            <Button 
              asChild
              className="w-full bg-nipost-blue hover:bg-nipost-dark-blue"
            >
              <Link href="/staff/login">
                Go to Staff Login
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You will be redirected automatically in 5 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}