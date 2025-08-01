import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("applicant"), // applicant, employer, admin
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  salary: integer("salary").notNull(),
  location: text("location").notNull(),
  deadline: timestamp("deadline").notNull(),
  tags: text("tags").array().notNull(),
  employerId: integer("employer_id").references(() => users.id).notNull(),
  company: text("company").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  resumeUrl: text("resume_url").notNull(),
  coverLetter: text("cover_letter").notNull(),
  status: text("status").notNull().default("pending"), // pending, reviewed, rejected
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  employer: one(users, {
    fields: [jobs.employerId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  salary: z.number().min(1, "Salary must be greater than 0"),
  location: z.string().min(1, "Location is required"),
  deadline: z.string().min(1, "Deadline is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  company: z.string().min(1, "Company name is required"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type JobWithApplications = Job & {
  applications: Application[];
  employer: User;
};
