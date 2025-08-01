import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all jobs with optional filtering
  app.get("/api/jobs", async (req, res) => {
    try {
      const { location, tags, search, page = "1", limit = "10" } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const filters = {
        location: location as string,
        tags: tags ? (tags as string).split(",") : undefined,
        search: search as string,
        limit: limitNum,
        offset: offset,
      };
      
      const result = await storage.getAllJobs(filters);
      
      res.json({
        jobs: result.jobs,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Create a new job (employer endpoint)
  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      
      // Convert deadline string to Date object
      const jobData = {
        ...validatedData,
        deadline: new Date(validatedData.deadline),
      };
      
      // For demo purposes, using employerId = 1
      // In a real app, this would come from authentication
      const employerId = 1;
      
      const job = await storage.createJob({ ...jobData, employerId });
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Update a job (employer endpoint)
  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const validatedData = insertJobSchema.parse(req.body);
      
      // Convert deadline string to Date object
      const jobData = {
        ...validatedData,
        deadline: new Date(validatedData.deadline),
      };
      
      const job = await storage.updateJob(jobId, jobData);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Delete a job (employer endpoint)
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const success = await storage.deleteJob(jobId);
      
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Get jobs by employer
  app.get("/api/employer/jobs", async (req, res) => {
    try {
      // For demo purposes, using employerId = 1
      const employerId = 1;
      const jobs = await storage.getJobsByEmployer(employerId);
      
      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const applicationCount = await storage.getApplicationCountByJob(job.id);
          return { ...job, applicationCount };
        })
      );
      
      res.json(jobsWithCounts);
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      res.status(500).json({ message: "Failed to fetch employer jobs" });
    }
  });

  // Submit job application
  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Get applications for a specific job
  app.get("/api/jobs/:id/applications", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Admin: Get all applications grouped by job
  app.get("/api/admin/applications", async (req, res) => {
    try {
      const jobsWithApplications = await storage.getAllApplicationsWithJobs();
      res.json(jobsWithApplications);
    } catch (error) {
      console.error("Error fetching admin applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Admin: Export applications as CSV
  app.get("/api/admin/export/applications", async (req, res) => {
    try {
      const jobsWithApplications = await storage.getAllApplicationsWithJobs();
      
      // Create CSV content
      const csvHeader = "Job Title,Company,Location,Applicant Name,Email,Resume URL,Applied Date,Status\n";
      
      const csvRows = jobsWithApplications.flatMap(job => 
        job.applications.map(app => 
          `"${job.title}","${job.company}","${job.location}","${app.name}","${app.email}","${app.resumeUrl}","${app.createdAt}","${app.status}"`
        )
      );
      
      const csvContent = csvHeader + csvRows.join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting applications:", error);
      res.status(500).json({ message: "Failed to export applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
