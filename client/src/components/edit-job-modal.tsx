import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { insertJobSchema, type InsertJob } from "@shared/schema";
import type { Job } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export default function EditJobModal({ isOpen, onClose, job }: EditJobModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const form = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      title: "",
      description: "",
      salary: 0,
      location: "",
      deadline: "",
      tags: [],
      company: "",
    },
  });

  // Update form values when job changes
  useEffect(() => {
    if (job) {
      const deadlineString = job.deadline.includes('T') 
        ? new Date(job.deadline).toISOString().split('T')[0]
        : job.deadline;
      form.reset({
        title: job.title,
        description: job.description,
        salary: job.salary,
        location: job.location,
        deadline: deadlineString,
        tags: job.tags,
        company: job.company,
      });
      setTags(job.tags);
    }
  }, [job, form]);

  const updateJobMutation = useMutation({
    mutationFn: (data: InsertJob) => 
      apiRequest(`/api/jobs/${job?.id}`, "PUT", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertJob) => {
    const jobData = { ...data, tags };
    updateJobMutation.mutate(jobData);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g., Senior Software Engineer"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                {...form.register("company")}
                placeholder="e.g., Tech Corp"
              />
              {form.formState.errors.company && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="e.g., San Francisco, CA"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salary">Annual Salary (USD) *</Label>
              <Input
                id="salary"
                type="number"
                {...form.register("salary", { valueAsNumber: true })}
                placeholder="e.g., 120000"
              />
              {form.formState.errors.salary && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.salary.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="deadline">Application Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              {...form.register("deadline")}
            />
            {form.formState.errors.deadline && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.deadline.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={6}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Skills & Tags *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill (e.g., React, Python)"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            {form.formState.errors.tags && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.tags.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateJobMutation.isPending}
              className="bg-primary text-white hover:bg-blue-600"
            >
              {updateJobMutation.isPending ? "Updating..." : "Update Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}