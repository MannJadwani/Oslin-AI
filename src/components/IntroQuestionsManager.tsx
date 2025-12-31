import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clock, RefreshCw, GripVertical, MessageSquare, Save } from "lucide-react";
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
  displayNumber: number;
  onUpdate: (text: string) => void;
  onUpdateTimeLimit: (timeLimit?: number) => void;
  onUpdateAllowRetake: (allowRetake: boolean) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function SortableQuestion({ question, index, displayNumber, onUpdate, onUpdateTimeLimit, onUpdateAllowRetake, onDelete, canDelete }: SortableQuestionProps) {
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
    <div ref={setNodeRef} style={style} className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-white hover:border-emerald-200 transition-colors group">
      <div className="flex gap-3 items-start">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-emerald-600 transition-colors mt-2 flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-white bg-emerald-600 w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-2">I{displayNumber}</span>
        <div className="flex-1">
          <Input
            value={question.text}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Type your intro question here..."
            className="rounded-xl bg-slate-50 border-slate-200 focus:border-slate-400 transition-all h-11"
          />
        </div>
        {canDelete && (
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full mt-1">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-6 pl-9">
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
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
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={question.allowRetake}
              onChange={(e) => onUpdateAllowRetake(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            Allow retakes
          </label>
        </div>
      </div>
    </div>
  );
}

export function IntroQuestionsManager() {
  const introQuestionsData = useQuery(api.introQuestions.get);
  const saveIntroQuestions = useMutation(api.introQuestions.save);
  
  const [questions, setQuestions] = useState<Array<{
    id: string;
    text: string;
    timeLimit?: number;
    allowRetake: boolean;
  }>>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load intro questions when data is available
  useEffect(() => {
    if (introQuestionsData !== undefined) {
      if (introQuestionsData?.questions && introQuestionsData.questions.length > 0) {
        // Reverse for display (newest at top)
        setQuestions([...introQuestionsData.questions].reverse());
      } else {
        setQuestions([]);
      }
      setHasChanges(false);
    }
  }, [introQuestionsData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const addQuestion = () => {
    const newQuestion = { id: crypto.randomUUID(), text: "", timeLimit: 120, allowRetake: true };
    setQuestions([newQuestion, ...questions]);
    setHasChanges(true);
  };

  const updateQuestion = (index: number, updates: Partial<typeof questions[0]>) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], ...updates };
      return newQuestions;
    });
    setHasChanges(true);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const validQuestions = questions.filter(q => q.text.trim());
    // Reverse to save in correct order (Q1 first)
    const questionsInOrder = [...validQuestions].reverse();

    setIsSaving(true);
    try {
      await saveIntroQuestions({ questions: questionsInOrder });
      toast.success("Intro questions saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save intro questions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-slate-200 rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Intro Questions</CardTitle>
            <CardDescription className="text-slate-500">
              These questions start every interview and are never shuffled.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 italic">
            New questions appear at the top. I1 is the first question asked in every interview.
          </p>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={addQuestion} 
            className="rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Intro Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">No intro questions yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addQuestion}
              className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 mr-1" /> Add your first intro question
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    index={idx}
                    displayNumber={questions.length - idx}
                    onUpdate={(text) => updateQuestion(idx, { text })}
                    onUpdateTimeLimit={(timeLimit) => updateQuestion(idx, { timeLimit })}
                    onUpdateAllowRetake={(allowRetake) => updateQuestion(idx, { allowRetake })}
                    onDelete={() => deleteQuestion(idx)}
                    canDelete={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {(hasChanges || questions.length > 0) && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Intro Questions"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}










