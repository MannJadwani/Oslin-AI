import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, Copy, Briefcase, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditJobProfile } from "./EditJobProfile";

interface JobProfileListProps {
  onSelectProfile: (id: Id<"jobProfiles">) => void;
}

export function JobProfileList({ onSelectProfile }: JobProfileListProps) {
  const profiles = useQuery(api.jobProfiles.list);
  const generatePublicLink = useMutation(api.jobProfiles.generatePublicLinkIfMissing);
  const [expandedProfile, setExpandedProfile] = useState<Id<"jobProfiles"> | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<Id<"jobProfiles"> | null>(null);

  const handleCopyLink = async (profile: any) => {
    try {
        let linkId = profile.publicLinkId;
        if (!linkId) {
            // Generate on the fly if missing (for old profiles)
            linkId = await generatePublicLink({ id: profile._id });
        }
      const link = `${window.location.origin}?interview=${linkId}`;
      
      await navigator.clipboard.writeText(link);
      toast.success("Job link copied! Send this to all candidates.");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (profiles === undefined) {
    return (
        <div className="space-y-4">
             {[1, 2].map((i) => (
                 <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
             ))}
        </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 border-dashed border-slate-200 rounded-2xl">
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-100">
            <Briefcase className="w-8 h-8 text-slate-400" />
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900 mb-2">No job profiles yet</CardTitle>
        <p className="text-slate-500 max-w-xs">Create your first job profile above to start interviewing candidates.</p>
      </Card>
    );
  }

  return (
    <>
      {editingProfileId && (
        <EditJobProfile 
          profileId={editingProfileId} 
          isOpen={!!editingProfileId} 
          onOpenChange={(open) => !open && setEditingProfileId(null)} 
        />
      )}
    <div className="grid gap-6">
      {profiles.map((profile) => (
          <Card key={profile._id} className="transition-all hover:shadow-md border-slate-100 rounded-2xl overflow-hidden group bg-white">
            <CardHeader className="pb-4 pt-6 px-6 bg-white">
              <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-slate-900">{profile.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-slate-500 text-sm">{profile.description}</CardDescription>
                </div>
                  <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => setEditingProfileId(profile._id)}
                        title="Edit profile"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                        className="rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setExpandedProfile(expandedProfile === profile._id ? null : profile._id)}
                >
                        {expandedProfile === profile._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
                  </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-4">
             <div className="flex gap-3 flex-wrap mb-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center">
                    {profile.questions.length} Questions
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold flex items-center">
                    {profile.qualifications.length} Qualifications
                </div>
             </div>

              {expandedProfile === profile._id && (
                 <div className="space-y-6 pt-4 mt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Qualifications</h4>
                            <ul className="space-y-2">
                                {profile.qualifications.map((q, i) => (
                                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                        {q}
                                    </li>
                                ))}
                    </ul>
                  </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Interview Questions</h4>
                             <ul className="space-y-3">
                                {profile.questions.map((q, i) => (
                                    <li key={q.id} className="text-sm text-slate-700 flex gap-3">
                                        <span className="font-mono text-xs font-bold text-white bg-indigo-600 w-5 h-5 flex items-center justify-center rounded flex-shrink-0 mt-0.5">{i+1}</span>
                                        <span>{q.text}</span>
                        </li>
                      ))}
                    </ul>
                        </div>
                  </div>
                </div>
              )}
          </CardContent>
          <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Profile
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSelectProfile(profile._id)}
                    className="rounded-xl border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 flex-1 sm:flex-none transition-all"
                >
                <Eye className="w-4 h-4 mr-2" />
                View Candidates
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                             <Button 
                                size="sm" 
                                onClick={() => handleCopyLink(profile)}
                                className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 flex-1 sm:flex-none"
                            >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Job Link
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Share this single link with all candidates</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
    </>
  );
}
