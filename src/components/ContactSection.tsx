import { useState } from 'react';
import { Mail, Github, Copy, Check, Send, Sparkles } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Connect</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Let's Collaborate
          </h2>
          <p className="text-neutral-400 text-sm mt-2">
            Have a project in mind, an interesting challenge, or just want to chat tech? Drop a line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Quick info cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono text-neutral-400 mb-1">Direct Email</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white truncate">
                  {PERSONAL_INFO.email}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title="Copy email address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono text-neutral-400 mb-1">GitHub Profile</div>
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm font-medium text-white hover:text-rose-400 transition-colors"
              >
                <span>github.com/PKFire-223</span>
                <Github className="w-4 h-4" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wide font-medium">Availability</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Currently open for select freelance contracts, open-source consulting, and engineering collaborations.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-3">
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Message Sent!</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Thanks for reaching out, {formState.name}. I'll get back to you at {formState.email} shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: '', email: '', message: '' });
                    }}
                    className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono text-neutral-400 mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono text-neutral-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-mono text-neutral-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell me about your project, idea, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-rose-900/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
