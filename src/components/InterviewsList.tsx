import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { InterviewDetail } from "./InterviewDetail";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Calendar, Mail, User, Search, Filter } from "lucide-react";

type SortKey = "date" | "score" | "title";

export function InterviewsList() {
  const interviews = useQuery(api.interviews.listAll);
  const [selectedInterview, setSelectedInterview] = useState<Id<"interviews"> | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");

  // Extract unique job titles for filter
  const uniqueJobTitles = useMemo(() => {
    if (!interviews) return [];
    const titles = new Set(interviews.map(i => i.jobTitle).filter(Boolean));
    return Array.from(titles).sort();
  }, [interviews]);

  const filteredAndSortedInterviews = useMemo(() => {
    if (!interviews) return [];

    let result = [...interviews];

    // 1. Filter out empty/pending-without-candidate
    result = result.filter(i => i.candidateName || i.status !== "pending");

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i => 
        (i.candidateName?.toLowerCase().includes(query)) ||
        (i.candidateEmail?.toLowerCase().includes(query)) ||
        (i.jobTitle?.toLowerCase().includes(query))
      );
    }

    // 3. Status Filter
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }

    // 4. Job Role Filter
    if (jobFilter !== "all") {
      result = result.filter(i => i.jobTitle === jobFilter);
    }

    // 5. Sort
    return result.sort((a, b) => {
      switch (sortKey) {
        case "date":
          return (b.startedAt || 0) - (a.startedAt || 0);
        case "score":
          const scoreA = a.overallScore ?? -1;
          const scoreB = b.overallScore ?? -1;
          return scoreB - scoreA;
        case "title":
          return (a.jobTitle || "").localeCompare(b.jobTitle || "");
        default:
          return 0;
      }
    });
  }, [interviews, sortKey, searchQuery, statusFilter, jobFilter]);

  if (interviews === undefined) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-[125px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (selectedInterview) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedInterview(null)}
          className="gap-2 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all candidates
        </Button>
        <InterviewDetail interviewId={selectedInterview} />
      </div>
    );
  }

  const getStatusClass = (status: string) => {
      switch (status) {
          case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
          case "in_progress": return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
          case "completed": return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200";
          case "analyzed": return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
          default: return "";
      }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card className="p-4 bg-muted/30 border-none shadow-none">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search candidates..." 
                    className="pl-9 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="analyzed">Analyzed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue placeholder="Job Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {uniqueJobTitles.map(title => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortKey} onValueChange={(val) => setSortKey(val as SortKey)}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Most Recent</SelectItem>
                        <SelectItem value="score">Highest Score</SelectItem>
                        <SelectItem value="title">Job Title</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </Card>

      {filteredAndSortedInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No candidates found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
                Try adjusting your search query or filters to see results.
            </p>
            <Button 
                variant="link" 
                onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setJobFilter("all");
                }}
            >
                Clear all filters
            </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedInterviews.map((interview) => (
                <Card key={interview._id} className="hover:shadow-md transition-shadow group cursor-pointer flex flex-col" onClick={() => setSelectedInterview(interview._id)}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Applying for</h4>
                            <CardTitle className="text-base font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                {interview.jobTitle}
                            </CardTitle>
                        </div>
                        <Badge variant="secondary" className={getStatusClass(interview.status)}>
                            {interview.status.replace("_", " ")}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-3 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{interview.candidateName || "Anonymous"}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{interview.candidateEmail}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t mt-auto">
                        {interview.startedAt && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(interview.startedAt).toLocaleDateString()}
                            </div>
                        )}
                        {interview.overallScore !== undefined && (
                            <Badge variant={interview.overallScore >= 70 ? "default" : "secondary"} className="ml-auto">
                                {interview.overallScore}%
                            </Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                    className="w-full"
                    variant={interview.status === "pending" ? "secondary" : "outline"}
                    >
                    View Submission
                    </Button>
                </CardFooter>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
