export interface IContainer {
  id: string;
  name: string;
  deployment: string;
  namespace: string;
  application: string;
  image: string;
  imageId: string;
  command: string;
  labels: { [label: string]: string };
  state: string;
  status: string;
  createdAt: number;
}

export interface IContainerStats {
  formattedStats: {
    cpuCurrentUsage: string;
    memoryUsage: string;
    memoryLimit: string;
    memoryPct: string;
    currentPids: string;
  };
  stats: any;
}
