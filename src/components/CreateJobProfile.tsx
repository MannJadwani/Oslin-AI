import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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

    if (!title || !description || validQualifications.length === 0 || validQuestions.length === 0) {
      toast.error("Please fill in all required fields");
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
      setTitle("");
      setDescription("");
      setQualifications([""]);
      setQuestions([{ id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }]);
    } catch (error) {
      toast.error("Failed to create job profile");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors shadow-sm hover:shadow"
      >
        + Create New Job Profile
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Job Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            rows={4}
            placeholder="Describe the role and responsibilities..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Required Qualifications</label>
          {qualifications.map((qual, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={qual}
                onChange={(e) => {
                  const newQuals = [...qualifications];
                  newQuals[idx] = e.target.value;
                  setQualifications(newQuals);
                }}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., 5+ years of React experience"
              />
              {qualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQualifications([...qualifications, ""])}
            className="text-sm text-primary hover:underline"
          >
            + Add Qualification
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Interview Questions</label>
          {questions.map((question, idx) => (
            <div key={question.id} className="border rounded-lg p-4 mb-3 space-y-2">
              <input
                type="text"
                value={question.text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].text = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter your question..."
              />
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.allowRetake}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[idx].allowRetake = e.target.checked;
                      setQuestions(newQuestions);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Allow retakes</span>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-sm">Time limit (seconds):</span>
                  <input
                    type="number"
                    value={question.timeLimit || ""}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[idx].timeLimit = e.target.value ? parseInt(e.target.value) : undefined;
                      setQuestions(newQuestions);
                    }}
                    className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-primary outline-none"
                    placeholder="None"
                    min="10"
                  />
                </label>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="ml-auto px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuestions([...questions, { id: crypto.randomUUID(), text: "", timeLimit: undefined, allowRetake: true }])}
            className="text-sm text-primary hover:underline"
          >
            + Add Question
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            Create Profile
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
