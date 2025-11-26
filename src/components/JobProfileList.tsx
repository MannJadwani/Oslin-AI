import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Link as LinkIcon, Eye, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobProfileListProps {
  onSelectProfile: (id: Id<"jobProfiles">) => void;
}

export function JobProfileList({ onSelectProfile }: JobProfileListProps) {
  const profiles = useQuery(api.jobProfiles.list);
  const generatePublicLink = useMutation(api.jobProfiles.generatePublicLinkIfMissing);
  const [expandedProfile, setExpandedProfile] = useState<Id<"jobProfiles"> | null>(null);

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
                 <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
             ))}
        </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 border-dashed">
        <CardTitle className="text-lg mb-2">No job profiles</CardTitle>
        <p className="text-muted-foreground">Get started by creating your first job profile.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {profiles.map((profile) => (
        <Card key={profile._id} className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl mb-1">{profile.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{profile.description}</CardDescription>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                onClick={() => setExpandedProfile(expandedProfile === profile._id ? null : profile._id)}
                >
                    {expandedProfile === profile._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
             <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant="secondary" className="text-xs">{profile.questions.length} Questions</Badge>
                <Badge variant="outline" className="text-xs">{profile.qualifications.length} Qualifications</Badge>
             </div>

              {expandedProfile === profile._id && (
                 <div className="space-y-4 pt-2 border-t animate-accordion-down">
                    <div className="grid md:grid-cols-2 gap-4">
                  <div>
                            <h4 className="text-sm font-medium mb-2">Qualifications</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {profile.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                  <div>
                            <h4 className="text-sm font-medium mb-2">Questions</h4>
                             <ul className="text-sm text-muted-foreground space-y-2">
                                {profile.questions.map((q, i) => (
                                    <li key={q.id} className="flex gap-2">
                                        <span className="font-mono text-xs text-primary pt-0.5">{i+1}.</span>
                                        <span>{q.text}</span>
                        </li>
                      ))}
                    </ul>
                        </div>
                  </div>
                </div>
              )}
          </CardContent>
          <CardFooter className="bg-muted/30 p-4 flex gap-3 justify-end items-center">
             <div className="text-xs text-muted-foreground mr-auto hidden sm:block">
                One link for all candidates
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelectProfile(profile._id)}>
                <Eye className="w-4 h-4 mr-2" />
                View Candidates
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button size="sm" onClick={() => handleCopyLink(profile)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Job Link
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Share this single link with all candidates</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
