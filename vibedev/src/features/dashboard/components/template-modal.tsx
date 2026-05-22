// src/features/dashboard/components/template-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { Templates } from "@prisma/client";
import { createPlaygroundAction } from "../actions/playground";
import { X, Code2, Terminal, Cpu, Braces, ArrowLeft, Globe, Zap, Workflow } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateModal = ({ isOpen, onClose }: TemplateModalProps) => {
  const [isPending, startTransition] = useTransition();
  
  // WIZARD STATE MATRIX MANAGEMENT
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Templates | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  if (!isOpen) return null;

  // Comprehensive array mapping all 6 supported framework instances
  const templateOptions = [
    { type: Templates.REACT, name: "React.js", desc: "Client-side modern virtual DOM application environment.", icon: Code2, color: "text-sky-400 border-sky-500/20 bg-sky-500/5" },
    { type: Templates.NEXTJS, name: "Next.js Core", desc: "Production edge-ready serverless rendering engine configuration.", icon: Cpu, color: "text-foreground border-foreground/20 bg-foreground/5" },
    { type: Templates.HONO, name: "Hono Web", desc: "Ultrafast edge-native routing proxy system blueprint.", icon: Terminal, color: "text-orange-400 border-orange-500/20 bg-orange-500/5" },
    { type: Templates.EXPRESS, name: "Node Express", desc: "Traditional microservice API cluster framework stack.", icon: Braces, color: "text-green-400 border-green-500/20 bg-green-500/5" },
    { type: Templates.VUE, name: "Vue.js", desc: "Approachable, high-performance intuitive reactive environment.", icon: Globe, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
    { type: Templates.ANGULAR, name: "Angular Node", desc: "Enterprise-grade component architecture compilation workspace.", icon: Workflow, color: "text-red-400 border-red-500/20 bg-red-500/5" },
  ];

  const handleAdvanceToForm = (type: Templates) => {
    setSelectedTemplate(type);
    // Auto-fill an elegant semantic baseline default name
    setProjectName(`vibe-${type.toLowerCase()}-app`);
    setStep(2);
  };

  const handleResetWizard = () => {
    setStep(1);
    setSelectedTemplate(null);
    setProjectName("");
    setProjectDesc("");
  };

  const handleCommitCreation = () => {
    if (!selectedTemplate || !projectName.trim() || isPending) return;

    startTransition(async () => {
      const result = await createPlaygroundAction({
        title: projectName.trim(),
        description: projectDesc.trim(),
        template: selectedTemplate,
      });

      if (result.success) {
        handleResetWizard();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-background/40 dark:bg-black/40 backdrop-blur-md animate-fade-in cursor-pointer" />

      <div className="relative w-full max-w-2xl border border-border/80 bg-card/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* UPPER HEADER VIEW CONTROL SECTION */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                {step === 1 ? "Provision Engine Template" : "Configure Container Specs"}
              </h2>
              <p className="text-xs text-muted-foreground font-light">
                {step === 1 ? "Select an environment stack engine from your core cluster array." : `Set up naming variables for your incoming ${selectedTemplate} node.`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: TECHNOLOGY SELECT MATRIX CARD PANEL */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1 py-1">
            {templateOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => handleAdvanceToForm(option.type)}
                  className="group relative text-left border border-border/80 bg-background/50 hover:bg-card hover:border-primary/40 p-4 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs flex flex-col gap-3"
                >
                  <div className={`p-2 rounded-lg border w-fit shadow-3xs ${option.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {option.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-light mt-1 leading-relaxed line-clamp-2">
                      {option.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: PREMIUM INPUT PARAMETERS METADATA FORM */}
        {step === 2 && (
          <div className="space-y-5 py-2 animate-in fade-in slide-in-from-right-4 duration-200">
            
            {/* Project Name Parameter Row */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground">
                Workspace Target Title <span className="text-primary">*</span>
              </label>
              <input 
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. cloud-compiler-interface"
                className="w-full h-11 px-4 border border-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-primary/40 transition-colors text-sm font-sans"
                maxLength={36}
                disabled={isPending}
              />
            </div>

            {/* Description Parameter Row */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground">
                Cluster Description Metadata <span className="text-muted-foreground/40">(Optional)</span>
              </label>
              <textarea 
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Describe the environment architecture context parameters..."
                className="w-full h-24 p-4 border border-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-primary/40 transition-colors text-sm font-sans resize-none"
                maxLength={140}
                disabled={isPending}
              />
            </div>

            {/* Form Actions Commit Layer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCommitCreation}
                disabled={!projectName.trim() || isPending}
                className="h-11 px-6 bg-foreground text-background font-bold rounded-xl shadow-md transition-all duration-200 hover:opacity-90 active:scale-98 disabled:opacity-40 text-sm cursor-pointer"
              >
                {isPending ? "Spawning Sandbox Instance..." : "Deploy Workspace Server"}
              </button>
            </div>

          </div>
        )}

        {/* BOTTOM LEDGER METRICS STATUS BAR */}
        <div className="mt-5 pt-3 border-t border-border/40 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest flex items-center justify-between shrink-0">
          <span>// STACK CONTEXT: {selectedTemplate || "UNBOUND"}</span>
          {isPending && <span className="text-primary animate-pulse">Writing configuration clusters...</span>}
        </div>

      </div>
    </div>
  );
};