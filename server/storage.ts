import { users, jobs, applications, type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type JobWithApplications } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, inArray, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Jobs
  getAllJobs(filters?: {
    location?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: Job[]; total: number }>;
  getJobById(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob & { employerId: number; deadline: Date }): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob & { deadline: Date }>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  
  // Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getAllApplicationsWithJobs(): Promise<Array<Job & { applications: Application[] }>>;
  getApplicationCountByJob(jobId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllJobs(filters?: {
    location?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    try {
      const conditions = [];
      
      if (filters?.location) {
        conditions.push(ilike(jobs.location, `%${filters.location}%`));
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        conditions.push(
          or(...filters.tags.map(tag => 
            sql`${jobs.tags} @> ARRAY[${tag}]::text[]`
          ))
        );
      }
      
      if (filters?.search) {
        conditions.push(
          or(
            ilike(jobs.title, `%${filters.search}%`),
            ilike(jobs.description, `%${filters.search}%`),
            ilike(jobs.company, `%${filters.search}%`)
          )
        );
      }
      
      // Get jobs with filters
      let jobQuery = db.select().from(jobs);
      if (conditions.length > 0) {
        jobQuery = jobQuery.where(and(...conditions));
      }
      jobQuery = jobQuery.orderBy(desc(jobs.createdAt));
      if (filters?.limit) {
        jobQuery = jobQuery.limit(filters.limit);
      }
      if (filters?.offset) {
        jobQuery = jobQuery.offset(filters.offset);
      }
      
      // Get count with same filters
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(jobs);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const [jobResults, countResults] = await Promise.all([
        jobQuery.execute(),
        countQuery.execute()
      ]);
      
      return {
        jobs: jobResults,
        total: countResults[0]?.count || 0
      };
    } catch (error) {
      console.error('Error in getAllJobs:', error);
      throw error;
    }
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: InsertJob & { employerId: number; deadline: Date }): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateJob(id: number, jobData: Partial<InsertJob & { deadline: Date }>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(jobData)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.employerId, employerId)).orderBy(desc(jobs.createdAt));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.createdAt));
  }

  async getAllApplicationsWithJobs(): Promise<Array<Job & { applications: Application[] }>> {
    const jobsWithApplications = await db
      .select()
      .from(jobs)
      .leftJoin(applications, eq(jobs.id, applications.jobId))
      .orderBy(desc(jobs.createdAt));

    const grouped = jobsWithApplications.reduce((acc, row) => {
      const job = row.jobs;
      const application = row.applications;
      
      if (!acc[job.id]) {
        acc[job.id] = { ...job, applications: [] };
      }
      
      if (application) {
        acc[job.id].applications.push(application);
      }
      
      return acc;
    }, {} as Record<number, Job & { applications: Application[] }>);

    return Object.values(grouped);
  }

  async getApplicationCountByJob(jobId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.jobId, jobId));
    
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
