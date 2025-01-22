export interface Project {
  id: string;
  name: string;
  description: string;
  xIntercept: number;
  yIntercept: number;
  middlePoint: { x: number; y: number };
  color: string;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ProjectData {
  project: Project;
  points: CurvePoint[];
}
