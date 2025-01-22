"use client";

import { useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sampleProjects } from "@/lib/data";
import { calculateAggregatedCurve, generateCurvePoints } from "@/lib/curve-utils";
import { ProjectData } from "../types";

export default function ProjectsPage() {
  const [totalFunding, setTotalFunding] = useState<number>(100000);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  const projectsData: ProjectData[] = sampleProjects.map(project => ({
    project,
    points: generateCurvePoints(project),
  }));

  const aggregatedCurve = calculateAggregatedCurve(sampleProjects);

  const visibleProjects = selectedProject
    ? projectsData.filter(({ project }) => project.id === selectedProject)
    : projectsData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Project Impact Analysis</h1>
          <p className="text-muted-foreground">
            Compare and analyze the impact curves of different projects to optimize fund allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Impact Curves</CardTitle>
              <CardDescription>Individual and aggregated project impact curves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      label={{ value: 'Funding ($)', position: 'bottom' }}
                      domain={[0, 'dataMax']}
                      allowDecimals={false}
                    />
                    <YAxis
                      label={{ value: 'Impact Score', angle: -90, position: 'left' }}
                      domain={[0, 100]}
                      allowDecimals={false}
                    />
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                    {visibleProjects.map(({ project, points }) => (
                      <Area
                        key={project.id}
                        type="monotone"
                        dataKey="y"
                        data={points}
                        name={project.name}
                        stroke={project.color}
                        fill={project.color}
                        fillOpacity={0.3}
                      />
                    ))}
                    {!selectedProject && (
                      <Area
                        type="monotone"
                        dataKey="y"
                        data={aggregatedCurve}
                        name="Aggregated Impact"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fund Allocation</CardTitle>
                <CardDescription>Set total funding amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="funding">Total Funding ($)</Label>
                    <Input
                      id="funding"
                      type="number"
                      value={totalFunding}
                      onChange={(e) => setTotalFunding(Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {projectsData.map(({ project }) => (
              <Card key={project.id} className={selectedProject === project.id ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Required Funding:</span>{" "}
                      ${project.xIntercept.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Max Impact:</span>{" "}
                      {project.yIntercept}
                    </div>
                  </div>
                  <div className="mt-4 space-x-2">
                    <Button
                      variant={selectedProject === project.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    >
                      {selectedProject === project.id ? "Show All" : "View Only"}
                    </Button>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}