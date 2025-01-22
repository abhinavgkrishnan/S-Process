"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sampleProjects } from "@/lib/data";
import { generateCurvePoints } from "@/lib/curve-utils";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const project = sampleProjects.find((p) => p.id === params.id);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  if (!project) {
    return <div>Project not found</div>;
  }

  const projectPoints = generateCurvePoints(project);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
            <Button
              onClick={() => router.push(`/submit?projectId=${project.id}`)}
            >
              Submit Your Curve
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Impact Curve</CardTitle>
            <CardDescription>
              Individual impact curve for {project.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    label={{ value: "Funding ($)", position: "bottom" }}
                    domain={[0, "dataMax"]}
                    allowDecimals={false}
                  />
                  <YAxis
                    label={{
                      value: "Impact Score",
                      angle: -90,
                      position: "left",
                    }}
                    domain={[0, 100]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="y"
                    name={project.name}
                    stroke={project.color}
                    fill={project.color}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium">Required Funding</dt>
                  <dd className="text-muted-foreground">
                    ${project.xIntercept.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Maximum Impact</dt>
                  <dd className="text-muted-foreground">
                    {project.yIntercept}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Middle Point Impact</dt>
                  <dd className="text-muted-foreground">
                    {project.middlePoint.y}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
