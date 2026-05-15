import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pollAPI } from "../lib/api";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";
import DotsBackground from "../components/ui/DotsBackground";

const newQ = () => ({
  _key: Math.random(),
  text: "",
  options: ["", ""],
  isMandatory: true,
});

export default function EditPollPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    isAnonymous: true,
    expiresAt: "",
  });

  const [questions, setQuestions] = useState([newQ()]);

  // ───── Load existing poll ─────
  useEffect(() => {
        const loadPoll = async () => {
      try {
        const res = await pollAPI.getById(id);
        const poll = res.data.data;

        setForm({
          title: poll.title || "",
          description: poll.description || "",
          isAnonymous: poll.isAnonymous,
          expiresAt: poll.expiresAt
            ? new Date(poll.expiresAt)
                .toISOString()
                .slice(0, 16)
            : "",
        });

        setQuestions(
          poll.questions.map((q) => ({
            ...q,
            _key: Math.random(),
          }))
        );

        // Allow edit even after close (per requirement).
        // Voting will still be blocked backend-side when status !== "active".
        // So we do not redirect here.
        // if (poll.status !== "active") {
        //   toast.error("This poll is closed and cannot be edited");
        //   nav("/dashboard");
        // }
      } catch {
        toast.error("Failed to load poll");
        nav("/dashboard");
      }
    };

    loadPoll();
  }, [id]);

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
      qs.map((q, j) =>
        j === i ? { ...q, [k]: v } : q
      )
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
          ? {
              ...q,
              options: [...q.options, ""],
            }
          : q
      )
    );

  const delOpt = (qi, oi) =>
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi && q.options.length > 2
          ? {
              ...q,
              options: q.options.filter(
                (_, k) => k !== oi
              ),
            }
          : q
      )
    );

  const addQ = () =>
    setQuestions((qs) => [...qs, newQ()]);

  const delQ = (i) =>
    setQuestions((qs) =>
      qs.length > 1
        ? qs.filter((_, j) => j !== i)
        : qs
    );

  // ───── validation step system ─────
  const nextStep = (e) => {
    e.preventDefault();

    if (step === 1 && !form.title.trim()) {
      return toast.error("Poll title required");
    }

    if (step === 2) {
      for (const q of questions) {
        if (!q.text.trim())
          return toast.error("Question required");

        if (
          q.options.filter((o) => o.trim())
            .length < 2
        ) {
          return toast.error(
            "Minimum 2 options required"
          );
        }
      }
    }

    if (step === 3 && !form.expiresAt) {
      return toast.error("Expiry required");
    }

    setStep((s) => s + 1);
  };

  // ───── submit update ─────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preserve expiresAt/status semantics for closed polls.
    // Requirement: after close, editing should not break voting; keep the same
    // close-related validity window.
    // If user changes expiresAt in UI, we still preserve the existing value
    // by sending it unchanged (already loaded from DB into form.expiresAt).
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      isAnonymous: form.isAnonymous,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
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
      // Allow changing expiresAt even after close (per requirement).
      const payloadToSend = payload;

      await pollAPI.update(id, payloadToSend);

      toast.success("Poll updated successfully");
      nav("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden "    >
      <DotsBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-20"  
        //  style={{ background: "radial-gradient(circle , rgba(99,102,241,0.12), transparent 40%), radial-gradient(circle at bottom, rgba(236,72,153,0.08), transparent 50%)", }}
         >
        <h1 className="font-display text-4xl font-bold mb-8">
          Edit Poll
        </h1>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex gap-3 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="flex-1 flex items-center"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
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
                    style={{
                      background:
                        step > s
                          ? "var(--accent)"
                          : "var(--border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <h2 className="font-display text-3xl font-bold">
            {step === 1 && "Poll Details"}
            {step === 2 && "Questions"}
            {step === 3 && "Settings"}
            {step === 4 && "Review"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div className="card glass p-6 space-y-4">
              <input
                value={form.title}
                onChange={sf("title")}
                placeholder="Poll title"
                className="input-field"
              />

              <textarea
                value={form.description}
                onChange={sf("description")}
                placeholder="Description"
                rows={5}
                className="textarea-field"
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              {questions.map((q, qi) => (
                <div
                  key={q._key}
                  className="card glass p-6 space-y-4"
                >
                  <div className="flex justify-between">
                    <span>
                      Question {qi + 1}
                    </span>

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
                      setQ(
                        qi,
                        "text",
                        e.target.value
                      )
                    }
                    className="input-field"
                    placeholder="Question"
                  />

                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className="flex gap-2"
                    >
                      <input
                        value={opt}
                        onChange={(e) =>
                          setOpt(
                            qi,
                            oi,
                            e.target.value
                          )
                        }
                        className="input-field"
                        placeholder={`Option ${
                          oi + 1
                        }`}
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            delOpt(qi, oi)
                          }
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

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card glass p-6 space-y-4">
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={sf("expiresAt")}
                className="input-field"
              />

              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={sf("isAnonymous")}
                />
                Anonymous voting
              </label>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="card glass p-6 space-y-6">
              <h2 className="text-2xl font-bold">
                {form.title}
              </h2>

              <p>{form.description}</p>

              {questions.map((q, i) => (
                <div key={i}>
                  <p className="font-semibold">
                    {q.text}
                  </p>

                  <ul>
                    {q.options.map((o, j) => (
                      <li key={j}>• {o}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* NAV */}
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
                  "Update Poll"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}