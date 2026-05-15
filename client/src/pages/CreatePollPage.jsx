import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pollAPI } from "../lib/api";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";
import DotsBackground from "../components/ui/DotsBackground.jsx";

const newQ = () => ({
  _key: Math.random(),
  text: "",
  options: ["", ""],
  isMandatory: true,
});

export default function CreatePollPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    isAnonymous: true,
    expiresAt: "",
  });

  const [questions, setQuestions] = useState([newQ()]);
  const nav = useNavigate();

  const sf = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    }));

  const setQ = (i, k, v) =>
    setQuestions((qs) =>
      qs.map((q, j) => (j === i ? { ...q, [k]: v } : q))
    );

  const setOpt = (qi, oi, v) =>
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi
          ? {
              ...q,
              options: q.options.map((o, k) =>
                k === oi ? v : o
              ),
            }
          : q
      )
    );

  const addOpt = (qi) =>
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );

  const delOpt = (qi, oi) =>
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi && q.options.length > 2
          ? {
              ...q,
              options: q.options.filter((_, k) => k !== oi),
            }
          : q
      )
    );

  const addQ = () => setQuestions((qs) => [...qs, newQ()]);

  const delQ = (i) =>
    setQuestions((qs) =>
      qs.length > 1
        ? qs.filter((_, j) => j !== i)
        : qs
    );

 const nextStep = (e) => {
  e.preventDefault();

  // Step 1 validation
  if (step === 1) {
    if (!form.title.trim()) {
      toast.error("Poll title required");
      return;
    }


  }

  // Step 2 validation
  if (step === 2) {
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error("Question required");
        return;
      }

      if (
        q.options.filter((o) => o.trim()).length < 2
      ) {
        toast.error(
          "Minimum 2 options required"
        );
        return;
      }
    }
  }

  // Step 3 validation
  if (step === 3) {
    if (!form.expiresAt) {
      toast.error("Expiry date required");
      return;
    }
  }

  setStep((prev) => prev + 1);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      isAnonymous: form.isAnonymous,
      ...(form.expiresAt && {
        expiresAt: new Date(
          form.expiresAt
        ).toISOString(),
      }),
      questions: questions.map(
        ({ text, isMandatory, options }) => ({
          text: text.trim(),
          isMandatory,
          options: options
            .map((o) => o.trim())
            .filter(Boolean),
        })
      ),
    };

    setLoading(true);

    try {
      const r = await pollAPI.create(payload);
      const poll = r.data.data;

      toast.success(
        `Poll created! Code: ${poll.accessCode}`
      );

      nav("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create poll"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"    >
      <DotsBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-20">
        <h1
          className="font-display text-4xl font-bold mb-8 tracking-tight"
          style={{ color: "var(--tx)" }}>
          Create Poll </h1>

        {/* Progress */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="flex items-center flex-1"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background:
                      step >= s
                        ? "var(--accent)"
                        : "var(--bg-surface)",
                    color:
                      step >= s
                        ? "#fff"
                        : "var(--tx-muted)",
                  }}
                >
                  {s}
                </div>

                {s < 4 && (
                  <div
                    className="flex-1 h-1"
                    style={{ background:step > s? "var(--accent)": "var(--border)", }} />
                )}
              </div>
            ))}
          </div>

          <h2
            className="font-display font-bold text-3xl" style={{ color: "var(--tx)" }}
          >
            {step === 1 && "Poll Details"}
            {step === 2 && "Add Questions"}
            {step === 3 && "Settings"}
            {step === 4 && "Review & Publish"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < 3) {
              e.preventDefault();
            }
          }}
          className="space-y-5"
        >
          {/* Step 1 */}
          {step === 1 && (
            <div className="card glass p-6 space-y-4">

          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tx-muted)" }}>  Poll Title</label>
              <input
                value={form.title} onChange={sf("title")} placeholder="Poll title" className="input-field"
              />
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--tx-muted)" }}>  Description</label>

              <textarea
                value={form.description}
                onChange={sf("description")}
                placeholder="Description"
                rows={5}
                className="textarea-field "
              />

              {/* <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={sf("expiresAt")}
                className="input-field"
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={sf("isAnonymous")}
                />
                <span>Anonymous voting</span>
              </label> */}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              {questions.map((q, qi) => (
                <div
                  key={q._key}
                  className="card glass p-6 space-y-4"
                >
                  <div className="flex justify-between">
                    <span>Question {qi + 1}</span>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => delQ(qi)}
                        className="btn-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    value={q.text}
                    onChange={(e) =>
                      setQ(qi, "text", e.target.value)
                    }
                    placeholder="Ask something..."
                    className="input-field"
                  />

                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className="flex gap-2"
                    >
                      <input
                        value={opt}
                        onChange={(e) =>
                          setOpt( qi, oi, e.target.value ) }
                        placeholder={`Option ${oi + 1}`}
                        className="input-field"
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button" onClick={() => delOpt(qi, oi) }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addOpt(qi)}
                    className="btn-ghost"
                  >
                    + Add option
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addQ}
                className="btn-ghost w-full"
              >
                + Add Question
              </button>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card glass p-6 space-y-4">
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={sf("expiresAt")}
                className="input-field"
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={sf("isAnonymous")}
                />
                <span>Anonymous voting</span>
              </label>
            </div>
          )}
          {/* Step 4 */}
          {/* Step 4 Review */}
            {step === 4 && (
              <div className="card glass p-8 space-y-8">

                {/* Header */}
                <div className="border-b pb-5" style={{ borderColor: "var(--border)" }}>
                  <h2
                    className="text-3xl font-bold mb-3"
                    style={{ color: "var(--tx)" }}
                  >
                    {form.title}
                  </h2>

                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "var(--tx-muted)" }}
                  >
                    {form.description}
                  </p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p className="text-sm opacity-70 mb-1">
                      Voting Type
                    </p>
                    <p className="font-semibold">
                      {form.isAnonymous
                        ? "Anonymous"
                        : "Public"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p className="text-sm opacity-70 mb-1">
                      Expires On
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        form.expiresAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="font-semibold text-lg mb-4"
                        style={{ color: "var(--tx)" }}
                      >
                        {i + 1}. {q.text}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((o, j) => (
                          <div
                            key={j}
                            className="px-4 py-3 rounded-lg"
                            style={{
                              background: "var(--bg)",
                              border:
                                "1px solid var(--border)",
                            }}
                          >
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() =>
                  setStep(step - 1)
                }
                className="btn-ghost flex-1"
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex-1"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  "Publish Poll"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}