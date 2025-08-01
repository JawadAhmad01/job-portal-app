import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applicationsApi } from "@/lib/api";
import { Briefcase, Users, Building, TrendingUp, Download, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const { data: jobsWithApplications, isLoading } = useQuery({
    queryKey: ["/api/admin/applications"],
    queryFn: applicationsApi.getAllApplicationsGrouped,
  });

  const handleExportCSV = async () => {
    try {
      await applicationsApi.exportApplicationsCSV();
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const stats = {
    totalJobs: jobsWithApplications?.length || 0,
    totalApplications: jobsWithApplications?.reduce((acc, job) => acc + job.applications.length, 0) || 0,
    totalEmployers: new Set(jobsWithApplications?.map(job => job.company)).size || 0,
    avgApplications: jobsWithApplications?.length ? 
      Math.round((jobsWithApplications.reduce((acc, job) => acc + job.applications.length, 0) / jobsWithApplications.length) * 10) / 10 : 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button
          onClick={handleExportCSV}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Applications CSV
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Building className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Applications/Job</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications by Job */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Job</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : jobsWithApplications && jobsWithApplications.length > 0 ? (
            <div className="space-y-8">
              {jobsWithApplications.map((job) => (
                <div key={job.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {job.applications.length}
                      </span>
                      <p className="text-sm text-gray-500">applications</p>
                    </div>
                  </div>

                  {job.applications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Applicant
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Applied Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Resume
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {job.applications.map((application) => (
                            <tr key={application.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {application.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {application.email}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(application.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <a 
                                  href={application.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-600 flex items-center"
                                >
                                  View Resume
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No applications received yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">Jobs will appear here once employers start posting.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
