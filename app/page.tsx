import { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Impact vs. Dollar Curve Visualization",
  description: "Interactive tool for visualizing project impact curves",
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Impact vs. Dollar Curve Visualization</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Analyze and compare project impact curves, optimize fund allocation, and make data-driven decisions
            for maximum social impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Link href="/projects">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle>View Projects</CardTitle>
                <CardDescription>
                  Explore existing project curves and their impact analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6">
                  <LineChart className="w-16 h-16 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/submit">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle>Submit New Project</CardTitle>
                <CardDescription>
                  Create and submit a new project impact curve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6">
                  <Button>Create New Project</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}