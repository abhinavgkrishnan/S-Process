"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  generateCurvePoints,
  calculateAggregatedCurve,
} from "@/lib/curve-utils";
import { sampleProjects } from "@/lib/data";
import { Project } from "@/app/types/index";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const project = sampleProjects.find((p) => p.id === params.id) || {
    id: "",
    name: "",
    description: "",
    xIntercept: 0,
    yIntercept: 0,
    middlePoint: { x: 0, y: 0 },
    color: "",
  };

  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const [newProject, setNewProject] = useState<Project>({
    id: String(Date.now()),
    name: "",
    description: "",
    xIntercept: 100000,
    yIntercept: 80,
    middlePoint: { x: 83000, y: 60 },
    color: "hsl(var(--chart-1))",
  });

  const [aggregateCurve, setAggregateCurve] = useState<Project[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<
    "x" | "y" | "middle" | null
  >(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  const curvePoints = generateCurvePoints(newProject);
  const aggregatePoints = calculateAggregatedCurve(aggregateCurve);

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

      setNewProject((prev) => {
        switch (draggingPoint) {
          case "x": {
            const newXIntercept = Math.max(
              0,
              Math.min(prev.xIntercept + deltaX, 200000),
            );
            const wasMiddleMoved = dragStart.x !== prev.middlePoint.x;
            const newMiddleX = wasMiddleMoved
              ? Math.max(
                  0,
                  Math.min(prev.middlePoint.x + deltaX / 2, newXIntercept),
                )
              : (prev.middlePoint.x / prev.xIntercept) * newXIntercept;

            return {
              ...prev,
              xIntercept: newXIntercept,
              middlePoint: {
                x: newMiddleX,
                y: prev.middlePoint.y,
              },
            };
          }
          case "y":
            return {
              ...prev,
              yIntercept: Math.max(0, Math.min(prev.yIntercept + deltaY, 100)),
            };
          case "middle":
            return {
              ...prev,
              middlePoint: {
                x: Math.max(
                  0,
                  Math.min(prev.middlePoint.x + deltaX, prev.xIntercept),
                ),
                y: Math.max(0, Math.min(prev.middlePoint.y + deltaY, 100)),
              },
            };
          default:
            return prev;
        }
      });

      setDragStart({ x: chartX, y: chartY });
    },
    [draggingPoint, dragStart],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAggregateCurve((prevCurves) => [...prevCurves, newProject]);
    console.log("New submission added:", newProject);
  };

  if (!project.id) {
    return <div>Project not found</div>;
  }

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
            <Button onClick={() => setShowSubmitForm(!showSubmitForm)}>
              {showSubmitForm ? "Hide Form" : "Submit Your Curve"}
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Aggregate Impact Curve</CardTitle>
            <CardDescription>
              Aggregated impact curve for all submitted curves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={aggregatePoints}
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
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {showSubmitForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Impact Curve Preview</CardTitle>
                  <CardDescription>
                    Drag the control points or use the sliders to adjust the
                    curve
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
                          stroke={newProject.color}
                          strokeWidth={2}
                          dot={false}
                        />
                        <svg
                          ref={svgRef}
                          className="absolute inset-0 pointer-events-auto"
                        >
                          {/* X-Intercept Control Point */}
                          <circle
                            cx={`${((newProject.xIntercept - 0) / (214600 - 0)) * 87 + 13}%`}
                            cy="87%"
                            r={6}
                            fill={newProject.color}
                            cursor="pointer"
                            onMouseDown={handleMouseDown("x")}
                          />

                          {/* Y-Intercept Control Point */}
                          <circle
                            cx="13%"
                            cy={`${100 - ((newProject.yIntercept - 0) / (106 - 0)) * 87 - 13}%`}
                            r={6}
                            fill={newProject.color}
                            cursor="pointer"
                            onMouseDown={handleMouseDown("y")}
                          />

                          {/* Ensure midpoint dot is always exactly on the curve */}
                          <circle
                            cx={`${((newProject.middlePoint.x - 0) / (214600 - 0)) * 87 + 13}%`} // ✅ X moves freely
                            cy={`${
                              100 -
                              ((curvePoints.reduce(
                                (prev, curr) =>
                                  Math.abs(curr.x - newProject.middlePoint.x) <
                                  Math.abs(prev.x - newProject.middlePoint.x)
                                    ? curr
                                    : prev,
                                curvePoints[0], // ✅ Ensure valid fallback
                              ).y ?? newProject.middlePoint.y) /
                                (106 - 0)) *
                                87 -
                              13
                            }%`} // ✅ Uses `reduce()` for best accuracy
                            r={6}
                            fill={newProject.color}
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Maximum Impact (Y-Intercept)</Label>
                      <Slider
                        value={[newProject.yIntercept]}
                        onValueChange={([value]) =>
                          setNewProject({ ...newProject, yIntercept: value })
                        }
                        min={0}
                        max={100}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground">
                        Value: {newProject.yIntercept}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Required Funding (X-Intercept)</Label>
                      <Slider
                        value={[newProject.xIntercept]}
                        onValueChange={([value]) =>
                          setNewProject({
                            ...newProject,
                            xIntercept: value,
                            // Only update middlePoint.x if it hasn't been manually moved
                            middlePoint: {
                              x:
                                newProject.middlePoint.x ===
                                newProject.xIntercept / 2
                                  ? value / 2
                                  : newProject.middlePoint.x,
                              y: newProject.middlePoint.y,
                            },
                          })
                        }
                        min={10000}
                        max={200000}
                        step={1000}
                      />
                      <p className="text-sm text-muted-foreground">
                        Value: ${newProject.xIntercept.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Midpoint X Position</Label>
                      <Slider
                        value={[newProject.middlePoint.x]}
                        onValueChange={([value]) =>
                          setNewProject({
                            ...newProject,
                            middlePoint: {
                              ...newProject.middlePoint,
                              x: Math.max(
                                0,
                                Math.min(value, newProject.xIntercept),
                              ), // ✅ Only update X
                            },
                          })
                        }
                        min={0}
                        max={newProject.xIntercept}
                        step={1000}
                      />
                      <p className="text-sm text-muted-foreground">
                        Value: {newProject.middlePoint.x.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Midpoint Y Position</Label>
                      <Slider
                        value={[newProject.middlePoint.y]}
                        onValueChange={([value]) =>
                          setNewProject({
                            ...newProject,
                            middlePoint: {
                              ...newProject.middlePoint,
                              y: Math.max(0, Math.min(value, 100)), // ✅ Only update Y
                            },
                          })
                        }
                        min={0}
                        max={100}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground">
                        Value: {newProject.middlePoint.y}
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Curve
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
