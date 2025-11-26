import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CreateJobProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([""]);
  const [questions, setQuestions] = useState<Array<{
    id: string;
    text: string;
    timeLimit?: number;
    allowRetake: boolean;
  }>>([{ id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }]);

  const createProfile = useMutation(api.jobProfiles.create);

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
      await createProfile({
        title,
        description,
        qualifications: validQualifications,
        questions: validQuestions,
      });
      
      toast.success("Job profile created successfully");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create job profile");
    }
  };

  const resetForm = () => {
      setTitle("");
      setDescription("");
      setQualifications([""]);
      setQuestions([{ id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
            Create Job Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Profile</DialogTitle>
          <DialogDescription>
            Define the role, qualifications, and interview questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Job Title</label>
                <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Product Designer"
          />
        </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Job Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Briefly describe the role..."
          />
        </div>
          </div>

          <Separator />

          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium leading-none">Qualifications</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setQualifications([...qualifications, ""])}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
             </div>
          {qualifications.map((qual, idx) => (
                <div key={idx} className="flex gap-2">
                    <Input
                value={qual}
                onChange={(e) => {
                  const newQuals = [...qualifications];
                  newQuals[idx] = e.target.value;
                  setQualifications(newQuals);
                }}
                        placeholder={`Qualification ${idx + 1}`}
              />
              {qualifications.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
              )}
            </div>
          ))}
        </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium leading-none">Interview Questions</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setQuestions([...questions, { id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }])}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
             </div>
          {questions.map((question, idx) => (
                 <div key={question.id} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                    <div className="flex gap-2 items-start">
                        <span className="text-sm font-mono text-muted-foreground pt-2.5">{idx + 1}.</span>
                        <Input
                value={question.text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].text = e.target.value;
                  setQuestions(newQuestions);
                }}
                            placeholder="Type your question here..."
                        />
                        {questions.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4 pl-6">
                         <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={question.timeLimit || ""}
                                onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[idx].timeLimit = e.target.value ? parseInt(e.target.value) : undefined;
                                    setQuestions(newQuestions);
                                }}
                                className="w-20 h-8"
                                placeholder="Secs"
                                min="10"
              />
                         </div>
                         <div className="flex items-center gap-2">
                             <RefreshCw className="w-4 h-4 text-muted-foreground" />
                             <label className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.allowRetake}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[idx].allowRetake = e.target.checked;
                      setQuestions(newQuestions);
                    }}
                                    className="rounded border-gray-300"
                  />
                                Allow retakes
                </label>
                         </div>
              </div>
            </div>
          ))}
        </div>

          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
             <Button type="submit">Create Profile</Button>
          </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
