import { apiRequest } from "./queryClient";

export interface Job {
  id: number;
  title: string;
  description: string;
  salary: number;
  location: string;
  deadline: string;
  tags: string[];
  company: string;
  createdAt: string;
  applicationCount?: number;
}

export interface Application {
  id: number;
  jobId: number;
  name: string;
  email: string;
  resumeUrl: string;
  coverLetter: string;
  status: string;
  createdAt: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface JobWithApplications extends Job {
  applications: Application[];
}

export const jobsApi = {
  getJobs: async (params?: {
    location?: string;
    tags?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<JobsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.location) searchParams.append("location", params.location);
    if (params?.tags) searchParams.append("tags", params.tags);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    
    const response = await apiRequest("GET", `/api/jobs?${searchParams}`);
    return response.json();
  },

  getJobById: async (id: number): Promise<Job> => {
    const response = await apiRequest("GET", `/api/jobs/${id}`);
    return response.json();
  },

  createJob: async (job: Omit<Job, "id" | "createdAt" | "applicationCount">): Promise<Job> => {
    const response = await apiRequest("POST", "/api/jobs", job);
    return response.json();
  },

  getEmployerJobs: async (): Promise<Job[]> => {
    const response = await apiRequest("GET", "/api/employer/jobs");
    return response.json();
  },
};

export const applicationsApi = {
  submitApplication: async (application: {
    jobId: number;
    name: string;
    email: string;
    resumeUrl: string;
    coverLetter: string;
  }): Promise<Application> => {
    const response = await apiRequest("POST", "/api/applications", application);
    return response.json();
  },

  getJobApplications: async (jobId: number): Promise<Application[]> => {
    const response = await apiRequest("GET", `/api/jobs/${jobId}/applications`);
    return response.json();
  },

  getAllApplicationsGrouped: async (): Promise<JobWithApplications[]> => {
    const response = await apiRequest("GET", "/api/admin/applications");
    return response.json();
  },

  exportApplicationsCSV: async (): Promise<void> => {
    const response = await apiRequest("GET", "/api/admin/export/applications");
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
