import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">JobPortal Pro</h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === "/" ? "text-gray-900" : "text-gray-500 hover:text-primary"
                  }`}
                >
                  Find Jobs
                </Link>
                <Link 
                  href="/employer" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === "/employer" ? "text-gray-900" : "text-gray-500 hover:text-primary"
                  }`}
                >
                  For Employers
                </Link>
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === "/admin" ? "text-gray-900" : "text-gray-500 hover:text-primary"
                  }`}
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/employer">
              <Button className="bg-primary text-white hover:bg-blue-600">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
