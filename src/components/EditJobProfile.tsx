import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EditJobProfileProps {
  profileId: Id<"jobProfiles">;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobProfile({ profileId, isOpen, onOpenChange }: EditJobProfileProps) {
  const profile = useQuery(api.jobProfiles.get, { id: profileId });
  const updateProfile = useMutation(api.jobProfiles.update);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([""]);
  const [questions, setQuestions] = useState<Array<{
    id: string;
    text: string;
    timeLimit?: number;
    allowRetake: boolean;
  }>>([{ id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }]);

  // Load profile data when it's available
  useEffect(() => {
    if (profile && isOpen) {
      setTitle(profile.title);
      setDescription(profile.description);
      setQualifications(profile.qualifications.length > 0 ? profile.qualifications : [""]);
      setQuestions(profile.questions.length > 0 ? profile.questions : [{ id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }]);
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validQualifications = qualifications.filter(q => q.trim());
    const validQuestions = questions.filter(q => q.text.trim());

    const missingFields = [];
    if (!title.trim()) missingFields.push("Job Title");
    if (!description.trim()) missingFields.push("Job Description");
    if (validQualifications.length === 0) missingFields.push("Qualifications");
    if (validQuestions.length === 0) missingFields.push("Interview Questions");

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      await updateProfile({
        id: profileId,
        title,
        description,
        qualifications: validQualifications,
        questions: validQuestions,
      });
      
      toast.success("Job profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update job profile");
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Job Profile</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update the role, qualifications, and interview questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Job Title</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Product Designer"
                        className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Job Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-white"
                        placeholder="Briefly describe the role..."
                    />
                </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Qualifications Section */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Qualifications</label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setQualifications([...qualifications, ""])} className="rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-1" /> Add Qualification
                    </Button>
                 </div>
                 <div className="space-y-3">
                    {qualifications.map((qual, idx) => (
                        <div key={idx} className="flex gap-3 items-center group">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <Input
                                value={qual}
                                onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx] = e.target.value;
                                setQualifications(newQuals);
                                }}
                                placeholder={`e.g. 5+ years of experience in React`}
                                className="rounded-xl bg-white border-slate-200 focus:border-slate-400 transition-all h-10"
                            />
                            {qualifications.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Questions Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Interview Questions</label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setQuestions([...questions, { id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }])} className="rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                 </div>
                 <div className="space-y-4">
                    {questions.map((question, idx) => (
                        <div key={question.id} className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/50 hover:border-indigo-200 transition-colors group">
                            <div className="flex gap-3 items-start">
                                <span className="text-xs font-bold text-white bg-indigo-600 w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-2">Q{idx + 1}</span>
                                <div className="flex-1">
                                    <Input
                                        value={question.text}
                                        onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[idx].text = e.target.value;
                                            setQuestions(newQuestions);
                                        }}
                                        placeholder="Type your question here..."
                                        className="rounded-xl bg-white border-slate-200 focus:border-slate-400 transition-all h-11"
                                    />
                                </div>
                                {questions.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full mt-1">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            
                            <div className="flex gap-6 pl-9">
                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={question.timeLimit || ""}
                                            onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[idx].timeLimit = e.target.value ? parseInt(e.target.value) : undefined;
                                                setQuestions(newQuestions);
                                            }}
                                            className="w-16 h-7 px-2 py-1 text-sm border-none bg-transparent focus-visible:ring-0 text-right p-0"
                                            placeholder="--"
                                            min="10"
                                        />
                                        <span className="text-xs text-slate-500 font-medium">seconds</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                    <RefreshCw className="w-4 h-4 text-slate-400" />
                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={question.allowRetake}
                                            onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[idx].allowRetake = e.target.checked;
                                                setQuestions(newQuestions);
                                            }}
                                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 w-4 h-4"
                                        />
                                        Allow retakes
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-slate-200 h-11 px-6">Cancel</Button>
             <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 px-8 shadow-md shadow-indigo-600/20">Update Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

