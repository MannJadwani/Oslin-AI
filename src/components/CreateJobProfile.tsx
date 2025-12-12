import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, RefreshCw, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableQuestionProps {
  question: {
    id: string;
    text: string;
    timeLimit?: number;
    allowRetake: boolean;
  };
  index: number;
  onUpdate: (text: string) => void;
  onUpdateTimeLimit: (timeLimit?: number) => void;
  onUpdateAllowRetake: (allowRetake: boolean) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function SortableQuestion({ question, index, displayNumber, onUpdate, onUpdateTimeLimit, onUpdateAllowRetake, onDelete, canDelete }: SortableQuestionProps & { displayNumber: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/50 hover:border-indigo-200 transition-colors group">
      <div className="flex gap-3 items-start">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 transition-colors mt-2 flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-white bg-indigo-600 w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-2">Q{displayNumber}</span>
        <div className="flex-1">
          <Input
            value={question.text}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Type your question here..."
            className="rounded-xl bg-white border-slate-200 focus:border-slate-400 transition-all h-11"
          />
        </div>
        {canDelete && (
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full mt-1">
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
              onChange={(e) => onUpdateTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
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
              onChange={(e) => onUpdateAllowRetake(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 w-4 h-4"
            />
            Allow retakes
          </label>
        </div>
      </div>
    </div>
  );
}

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
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      // Reverse questions so first entered becomes Q1 in the interview
      // (since we prepend for UI, oldest is at the end)
      const questionsInOrder = [...validQuestions].reverse();
      
      await createProfile({
        title,
        description,
        qualifications: validQualifications,
        questions: questionsInOrder,
        shuffleQuestions,
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
      setShuffleQuestions(false);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = () => {
    const newQuestion = { id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true };
    // Prepend to show at TOP for easy editing
    setQuestions([newQuestion, ...questions]);
    // New question is already at top, no scroll needed
  };

  const updateQuestion = (index: number, updates: Partial<typeof questions[0]>) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], ...updates };
      return newQuestions;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-white font-medium h-11">
            Create Job Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">Create New Job Profile</DialogTitle>
          <DialogDescription className="text-slate-500">
            Define the role, qualifications, and interview questions.
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => setQualifications([...qualifications, ""])} className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100">
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
                    <Button type="button" variant="ghost" size="sm" onClick={addQuestion} className="rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                 </div>
                 
                 <div className="space-y-3">
                   <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                     <input
                       type="checkbox"
                       checked={shuffleQuestions}
                       onChange={(e) => setShuffleQuestions(e.target.checked)}
                       className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                     />
                     <span>Shuffle questions for every new candidate</span>
                   </label>
                 </div>

                 <DndContext
                   sensors={sensors}
                   collisionDetection={closestCenter}
                   onDragEnd={handleDragEnd}
                 >
                 <p className="text-xs text-slate-500 italic mb-2">
                   New questions appear at the top for easy editing. Q1 is the first question in the interview.
                 </p>
                 
                   <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                     <div className="space-y-4">
                       {questions.map((question, idx) => (
                         <div key={question.id}>
                           <SortableQuestion
                             question={question}
                             index={idx}
                             displayNumber={questions.length - idx}
                             onUpdate={(text) => updateQuestion(idx, { text })}
                             onUpdateTimeLimit={(timeLimit) => updateQuestion(idx, { timeLimit })}
                             onUpdateAllowRetake={(allowRetake) => updateQuestion(idx, { allowRetake })}
                             onDelete={() => setQuestions(questions.filter((_, i) => i !== idx))}
                             canDelete={questions.length > 1}
                           />
                         </div>
                       ))}
                     </div>
                   </SortableContext>
                 </DndContext>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
             <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-slate-200 h-11 px-6">Cancel</Button>
             <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 px-8 shadow-md shadow-indigo-600/20">Create Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
