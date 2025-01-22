"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { generateCurvePoints } from "@/lib/curve-utils";
import { Project } from "../types";

export default function SubmitPage() {
  const [project, setProject] = useState<Project>({
    id: String(Date.now()),
    name: "",
    description: "",
    xIntercept: 50000,
    yIntercept: 85,
    middlePoint: { x: 25000, y: 45 },
    color: "hsl(var(--chart-1))",
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<
    "x" | "y" | "middle" | null
  >(null);
  const curvePoints = generateCurvePoints(project);

  const handleMouseDown =
    (point: "x" | "y" | "middle") => (e: React.MouseEvent) => {
      e.preventDefault();
      setDraggingPoint(point);
    };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingPoint || !svgRef.current) return;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert screen coordinates to chart values
      const xScale = 200000 / rect.width;
      const yScale = 100 / rect.height;
      const chartX = Math.max(0, Math.min(x * xScale, 200000));
      const chartY = Math.max(0, Math.min(100 - y * yScale, 100));

      switch (draggingPoint) {
        case "x":
          setProject((prev) => ({
            ...prev,
            xIntercept: chartX,
            middlePoint: { ...prev.middlePoint, x: chartX / 2 },
          }));
          break;
        case "y":
          setProject((prev) => ({ ...prev, yIntercept: chartY }));
          break;
        case "middle":
          setProject((prev) => ({
            ...prev,
            middlePoint: {
              ...prev.middlePoint,
              y: chartY,
            },
          }));
          break;
      }
    },
    [draggingPoint],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  useEffect(() => {
    if (draggingPoint) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingPoint, handleMouseMove, handleMouseUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle project submission
    console.log("Project submitted:", project);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Submit New Project</h1>
          <p className="text-muted-foreground">
            Create a new project impact curve by dragging control points or
            adjusting sliders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Impact Curve Preview</CardTitle>
                <CardDescription>
                  Drag the control points or use the sliders to adjust the curve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={curvePoints}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        label={{ value: "Funding ($)", position: "bottom" }}
                        domain={[0, "dataMax"]}
                      />
                      <YAxis
                        label={{
                          value: "Impact Score",
                          angle: -90,
                          position: "left",
                        }}
                        domain={[0, 100]}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke={project.color}
                        strokeWidth={2}
                        dot={false}
                      />
                      <svg ref={svgRef} className="absolute inset-0">
                        {/* X-intercept control point */}
                        <circle
                          cx={`${(project.xIntercept / 200000) * 100}%`}
                          cy="100%"
                          r={6}
                          fill={project.color}
                          cursor="pointer"
                          onMouseDown={handleMouseDown("x")}
                        />
                        {/* Y-intercept control point */}
                        <circle
                          cx="0%"
                          cy={`${100 - project.yIntercept}%`}
                          r={6}
                          fill={project.color}
                          cursor="pointer"
                          onMouseDown={handleMouseDown("y")}
                        />
                        {/* Middle control point */}
                        <circle
                          cx={`${(project.middlePoint.x / 200000) * 100}%`}
                          cy={`${100 - project.middlePoint.y}%`}
                          r={6}
                          fill={project.color}
                          cursor="pointer"
                          onMouseDown={handleMouseDown("middle")}
                        />
                      </svg>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Configure your project parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={project.name}
                    onChange={(e) =>
                      setProject({ ...project, name: e.target.value })
                    }
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={project.description}
                    onChange={(e) =>
                      setProject({ ...project, description: e.target.value })
                    }
                    placeholder="Enter project description"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum Impact (Y-Intercept)</Label>
                    <Slider
                      value={[project.yIntercept]}
                      onValueChange={([value]) =>
                        setProject({ ...project, yIntercept: value })
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      Value: {project.yIntercept}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Required Funding (X-Intercept)</Label>
                    <Slider
                      value={[project.xIntercept]}
                      onValueChange={([value]) =>
                        setProject({
                          ...project,
                          xIntercept: parseFloat(value.toFixed(2)),
                          middlePoint: { ...project.middlePoint, x: value / 2 },
                        })
                      }
                      min={10000}
                      max={200000}
                      step={1000}
                    />
                    <p className="text-sm text-muted-foreground">
                      Value: ${project.xIntercept.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Middle Point Impact</Label>
                    <Slider
                      value={[project.middlePoint.y]}
                      onValueChange={([value]) =>
                        setProject({
                          ...project,
                          middlePoint: { ...project.middlePoint, y: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      Value: {project.middlePoint.y}
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Project
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
