import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { InterviewDetail } from "./InterviewDetail";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, User, Search, AlertCircle, CheckCircle2, Clock, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

type SortKey = "date" | "score" | "title";

export function InterviewsList() {
  const interviews = useQuery(api.interviews.listAll);
  const deleteInterview = useMutation(api.interviews.deleteInterview);
  const [selectedInterview, setSelectedInterview] = useState<Id<"interviews"> | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<Id<"interviews"> | null>(null);

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
        <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <Skeleton className="h-14 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </div>
    );
  }

  if (selectedInterview) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedInterview(null)}
          className="gap-2 pl-0 hover:pl-2 transition-all rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to candidates
        </Button>
        <InterviewDetail interviewId={selectedInterview} onDelete={() => setSelectedInterview(null)} />
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
          case "pending": return { class: "bg-amber-50 text-amber-700", icon: Clock, label: "Pending" };
          case "in_progress": return { class: "bg-sky-50 text-sky-700", icon: Clock, label: "In Progress" };
          case "completed": return { class: "bg-violet-50 text-violet-700", icon: CheckCircle2, label: "Completed" };
          case "analyzed": return { class: "bg-emerald-50 text-emerald-700", icon: CheckCircle2, label: "Analyzed" };
          default: return { class: "bg-slate-100 text-slate-700", icon: AlertCircle, label: status };
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, interviewId: Id<"interviews">) => {
    e.stopPropagation(); // Prevent row click
    setInterviewToDelete(interviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;
    
    try {
      await deleteInterview({ interviewId: interviewToDelete });
      toast.success("Interview deleted successfully");
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
      // If the deleted interview was selected, go back to list
      if (selectedInterview === interviewToDelete) {
        setSelectedInterview(null);
      }
    } catch (error) {
      toast.error("Failed to delete interview");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search candidates by name, email, or role..." 
                    className="pl-11 h-11 bg-white border-slate-200 focus:border-indigo-300 rounded-xl transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-11 bg-white border-slate-200 rounded-xl">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="analyzed">Analyzed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 rounded-xl">
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
                    <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200 rounded-xl">
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

      {filteredAndSortedInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="rounded-xl bg-slate-100 p-4 mb-4">
                <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No candidates found</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-6">
                Try adjusting your search query or filters to see results.
            </p>
            <Button 
                variant="outline" 
                className="rounded-xl border-slate-200"
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Candidate</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Score</div>
            <div className="col-span-1 text-right">Date</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredAndSortedInterviews.map((interview) => {
                const statusConfig = getStatusConfig(interview.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div 
                    key={interview._id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedInterview(interview._id)}
                  >
                    {/* Candidate */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {interview.candidateName ? interview.candidateName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{interview.candidateName || "Anonymous"}</p>
                        <p className="text-sm text-slate-500 truncate">{interview.candidateEmail}</p>
                        </div>
                    </div>
                    
                    {/* Role */}
                    <div className="col-span-3">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium truncate max-w-full">
                        {interview.jobTitle}
                      </span>
                        </div>
                    
                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                            </div>
                    
                    {/* Score */}
                    <div className="col-span-1 text-center">
                      {interview.overallScore !== undefined ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${interview.overallScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {interview.overallScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </div>
                    
                    {/* Date */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {interview.startedAt ? new Date(interview.startedAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(e, interview._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                );
            })}
                            </div>
          
          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
            Showing {filteredAndSortedInterviews.length} candidate{filteredAndSortedInterviews.length !== 1 ? 's' : ''}
          </div>
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone. All responses, videos, and analysis data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setInterviewToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
