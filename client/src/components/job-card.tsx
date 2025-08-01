import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, Users, Eye } from "lucide-react";
import type { Job } from "@/lib/api";

interface JobCardProps {
  job: Job & { applicationCount?: number };
  onApply: (job: Job) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours > 0 ? `${hours} hours ago` : 'Today';
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-2">{job.company}</p>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{job.location}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>Posted {getTimeAgo(job.createdAt)}</span>
          </div>
          <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatSalary(job.salary)}</div>
          <div className="text-sm text-gray-500 mb-3">per year</div>
          <div className="text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 inline mr-1" />
            Deadline: {formatDate(job.deadline)}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
            }}
            className="bg-primary text-white hover:bg-blue-600"
          >
            Apply Now
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {job.applicationCount || 0} applicants
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </div>
      </div>
    </div>
  );
}
