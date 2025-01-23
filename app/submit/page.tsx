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

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handleMouseDown =
    (point: "x" | "y" | "middle") => (e: React.MouseEvent) => {
      e.preventDefault();

      if (!svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      const xScale = 200000 / rect.width;
      const yScale = 100 / rect.height;

      // Get current mouse position in chart coordinates
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const chartX = Math.round((mouseX * xScale) / 1000) * 1000;
      const chartY = 100 - mouseY * yScale;

      // Store the initial mouse click position
      setDragStart({ x: chartX, y: chartY });
      setDraggingPoint(point);
    };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingPoint || !svgRef.current || !dragStart) return;
  
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      // Convert screen coordinates to chart values
      const xScale = 200000 / rect.width;
      const yScale = 100 / rect.height;
  
      let chartX = Math.round((x * xScale) / 1000) * 1000;
      let chartY = 100 - y * yScale;
  
      // Calculate movement delta
      const deltaX = chartX - dragStart.x;
      const deltaY = chartY - dragStart.y;
  
      console.log("Mouse:", x, y);
      console.log("Chart:", chartX, chartY);
      console.log("Delta:", deltaX, deltaY);
  
      setProject((prev) => {
        switch (draggingPoint) {
          case "x": {
            // ✅ Ensure `xIntercept` is within [0, 200,000]
            const newXIntercept = Math.max(0, Math.min(prev.xIntercept + deltaX, 200000));
  
            // ✅ If middlePoint.x has not been changed manually, scale it proportionally
            const wasMiddleMoved = dragStart.x !== prev.middlePoint.x;
            const newMiddleX = wasMiddleMoved
              ? Math.max(0, Math.min(prev.middlePoint.x + deltaX / 2, newXIntercept))
              : (prev.middlePoint.x / prev.xIntercept) * newXIntercept;
  
            return {
              ...prev,
              xIntercept: newXIntercept,
              middlePoint: {
                x: newMiddleX, // ✅ Smooth transition, no snap
                y: prev.middlePoint.y,
              },
            };
          }
          case "y":
            return {
              ...prev,
              yIntercept: Math.max(0, Math.min(prev.yIntercept + deltaY, 100)), // ✅ Keep within 0-100
            };
          case "middle":
            return {
              ...prev,
              middlePoint: {
                x: Math.max(0, Math.min(prev.middlePoint.x + deltaX, prev.xIntercept)), // ✅ Keep within x bounds
                y: Math.max(0, Math.min(prev.middlePoint.y + deltaY, 100)), // ✅ Keep within y bounds
              },
            };
          default:
            return prev;
        }
      });
  
      // ✅ Keep updating dragStart for smooth dragging
      setDragStart({ x: chartX, y: chartY });
    },
    [draggingPoint, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
    setDragStart(null);
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

  useEffect(() => {
    setProject((prev) => ({
      ...prev,
      middlePoint: {
        x: prev.xIntercept / 2, // ✅ Ensure x stays at the center
        y: prev.middlePoint.y, // ✅ Do NOT override y!
      },
    }));
  }, [project.xIntercept]);

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
                        domain={[0, 200000]}
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
                      <svg
                        ref={svgRef}
                        className="absolute inset-0 pointer-events-auto"
                      >
                        {/* X-Intercept Control Point */}
                        <circle
                          cx={`${((project.xIntercept - 0) / (214600 - 0)) * 87 + 13}%`}
                          cy="87%"
                          r={6}
                          fill={project.color}
                          cursor="pointer"
                          onMouseDown={handleMouseDown("x")}
                        />

                        {/* Y-Intercept Control Point */}
                        <circle
                          cx="13%"
                          cy={`${100 - ((project.yIntercept - 0) / (106 - 0)) * 87 - 13}%`}
                          r={6}
                          fill={project.color}
                          cursor="pointer"
                          onMouseDown={handleMouseDown("y")}
                        />

                        {/* Ensure midpoint dot is always exactly on the curve */}
                        <circle
                          cx={`${((project.middlePoint.x - 0) / (214600 - 0)) * 87 + 13}%`} // ✅ X moves freely
                          cy={`${
                            100 -
                            ((curvePoints.reduce(
                              (prev, curr) =>
                                Math.abs(curr.x - project.middlePoint.x) <
                                Math.abs(prev.x - project.middlePoint.x)
                                  ? curr
                                  : prev,
                              curvePoints[0], // ✅ Ensure valid fallback
                            ).y ?? project.middlePoint.y) /
                              (106 - 0)) *
                              87 -
                            13
                          }%`} // ✅ Uses `reduce()` for best accuracy
                          r={6}
                          fill={project.color}
                          cursor="grab"
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
                          xIntercept: value,
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
                    <Label>Midpoint X Position</Label>
                    <Slider
                      value={[project.middlePoint.x]}
                      onValueChange={([value]) =>
                        setProject({
                          ...project,
                          middlePoint: {
                            ...project.middlePoint,
                            x: Math.max(0, Math.min(value, project.xIntercept)), // ✅ Only update X
                          },
                        })
                      }
                      min={0}
                      max={project.xIntercept}
                      step={1000}
                    />
                    <p className="text-sm text-muted-foreground">
                      Value: {project.middlePoint.x.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Midpoint Y Position</Label>
                    <Slider
                      value={[project.middlePoint.y]}
                      onValueChange={([value]) =>
                        setProject({
                          ...project,
                          middlePoint: {
                            ...project.middlePoint,
                            y: Math.max(0, Math.min(value, 100)), // ✅ Only update Y
                          },
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
