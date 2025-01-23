import { Project } from "@/app/types";

export const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Clean Energy Initiative",
    description: "Solar panel installation project for urban communities",
    xIntercept: 50000,
    yIntercept: 85,
    middlePoint: { x: 25000, y: 45 },
    color: "hsl(var(--chart-1))",
  },
  {
    id: "2",
    name: "Education Access Program",
    description: "Digital learning resources for underserved schools",
    xIntercept: 193000,
    yIntercept: 95,
    middlePoint: { x: 157500, y: 94 },
    color: "hsl(var(--chart-2))",
  },
  {
    id: "3",
    name: "Healthcare Outreach",
    description: "Mobile medical clinics for rural areas",
    xIntercept: 100000,
    yIntercept: 90,
    middlePoint: { x: 50000, y: 55 },
    color: "hsl(var(--chart-3))",
  },
];
