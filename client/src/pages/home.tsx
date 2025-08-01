import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";
import JobFilters from "@/components/job-filters";
import JobApplicationModal from "@/components/job-application-modal";
import { jobsApi, type Job } from "@/lib/api";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [filters, setFilters] = useState<{
    location?: string;
    tags?: string[];
    search?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLocation, setHeroLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/jobs", filters, currentPage],
    queryFn: () => jobsApi.getJobs({ 
      ...filters, 
      page: currentPage, 
      limit: 10,
      tags: filters.tags?.join(",")
    }),
  });

  const handleHeroSearch = () => {
    setFilters({
      search: heroSearch || undefined,
      location: heroLocation || undefined,
    });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedJob(null);
  };

  const totalPages = jobsData?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Job Today</h1>
          <p className="text-xl mb-6 text-blue-100">
            Discover thousands of job opportunities from top companies worldwide
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 rounded-md border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Location"
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 rounded-md border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              onClick={handleHeroSearch}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-md font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Jobs
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <JobFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {jobsData?.total || 0} Jobs Found
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobsData?.jobs.map((job) => (
                  <JobCard key={job.id} job={job} onApply={handleApply} />
                ))}
              </div>

              {jobsData?.jobs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-primary text-white" : ""}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JobApplicationModal
        job={selectedJob}
        isOpen={isApplicationModalOpen}
        onClose={handleCloseApplicationModal}
      />
    </div>
  );
}
