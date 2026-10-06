"use client";

import { useState, useMemo } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  ExternalLink,
  Users,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  X,
  Code,
  DollarSign,
  Layers,
  UserCheck,
  UserPlus,
  Trash2,
} from "lucide-react";
import ActivityTimeline from "./ActivityTimeline";

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function ProjectsModule({
  projects = [],
  clients = [],
  tasks = [],
  profiles = [],
  isDark = false,
  onCreateProject,
  onUpdateProject,
  onAssignProjectMember,
  onRemoveProjectMember,
  onOpenProjectChat,
  onOpenTaskDetails,
  onHandoverToSupport,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  
  // Team member assignment state
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [assigneeRole, setAssigneeRole] = useState("developer");

  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    client_id: "",
    tech_lead_id: "",
    description: "",
    status: "planning",
    priority: "medium",
    budget: "",
    start_date: new Date().toISOString().split("T")[0],
    target_date: "",
    github_repo: "",
    staging_url: "",
  });

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchQuery =
        !q ||
        [p.name, p.description, p.github_repo, p.tech_lead?.full_name].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );
      return matchStatus && matchQuery;
    });
  }, [projects, query, statusFilter]);

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === "in_progress").length;
    const qaTesting = projects.filter((p) => p.status === "qa_testing").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    return { total, inProgress, qaTesting, completed };
  }, [projects]);

  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newProjectForm.name) return;
    onCreateProject?.(newProjectForm);
    setShowAddProjectModal(false);
    setNewProjectForm({
      name: "",
      client_id: "",
      tech_lead_id: "",
      description: "",
      status: "planning",
      priority: "medium",
      budget: "",
      start_date: new Date().toISOString().split("T")[0],
      target_date: "",
      github_repo: "",
      staging_url: "",
    });
  }

  async function handleAssignMemberToProject() {
    if (!selectedProject || !assigneeUserId) return;
    const added = await onAssignProjectMember?.(selectedProject.id, assigneeUserId, assigneeRole);
    if (added) {
      const updatedMembers = [...(selectedProject.members || []), added];
      setSelectedProject({ ...selectedProject, members: updatedMembers });
      setAssigneeUserId("");
    }
  }

  async function handleRemoveMemberFromProject(memberId) {
    if (!selectedProject || !memberId) return;
    const ok = await onRemoveProjectMember?.(memberId);
    if (ok) {
      const updatedMembers = (selectedProject.members || []).filter((m) => m.id !== memberId);
      setSelectedProject({ ...selectedProject, members: updatedMembers });
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Projects & Engineering Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Commercial Client Delivery: Requirements → Assigned Head → Developers & Interns → QA → Handover.
          </p>
        </div>

        <button
          onClick={() => setShowAddProjectModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Commercial Project</span>
        </button>
      </div>

      {/* 2. Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Total Projects</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.total}</div>
          <div className="text-[11px] text-gray-400 mt-1">Active client deliverables</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>In Development</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 text-orange-600 dark:text-orange-400">
            {stats.inProgress}
          </div>
          <div className="text-[11px] text-orange-600 mt-1 font-medium">Head & Team active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>QA & Code Review</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.qaTesting}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
            Pending sign-off
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Completed & Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Delivered to client</div>
        </div>
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects by name, description, repo, head..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "planning", label: "Planning" },
            { id: "in_progress", label: "In Progress" },
            { id: "qa_testing", label: "QA Testing" },
            { id: "completed", label: "Completed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st.id
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const client = clients.find((c) => c.id === project.client_id);
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const completedTasks = projectTasks.filter((t) => ["completed", "approved"].includes(t.status));
          const progress =
            projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
          const assignedMembers = project.members || [];
          const techLead = project.tech_lead || profiles.find((p) => p.id === project.tech_lead_id);

          return (
            <div
              key={project.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] hover:border-orange-500/60 transition shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-1">
                      {project.name}
                    </h3>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {client?.name || "Client Project"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      project.status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : project.status === "in_progress"
                        ? "bg-blue-50 text-blue-600"
                        : project.status === "qa_testing"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {project.status?.replace("_", " ")?.toUpperCase()}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2 mt-2">
                    {project.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Sprint Deliverables</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Head & Assigned Team Members */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#3a3020] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Project Head:</span>
                    <span className="font-bold text-gray-800 dark:text-white truncate max-w-[160px]" title={techLead?.full_name || "Department Head"}>
                      {techLead?.full_name || "Department Head"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Assigned Team:</span>
                    {assignedMembers.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-semibold text-gray-700 dark:text-neutral-300">
                          {assignedMembers.length} {assignedMembers.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Head Only</span>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500 dark:text-neutral-400 pt-2 border-t border-gray-100 dark:border-[#3a3020]">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Target Date</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {project.target_date || "Open"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Budget</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      ₹{(Number(project.budget) || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-[#3a3020]">
                <button
                  onClick={() => onOpenProjectChat?.(project)}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Open Project Team Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Team Chat</span>
                </button>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Team & Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Manage Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedProject.name}
                </h2>
                <span className="text-xs text-orange-600">Project Leadership, Team & Delivery</span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Project Status */}
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Update Project Status
                </label>
                <select
                  value={selectedProject.status || "in_progress"}
                  onChange={(e) => {
                    const newSt = e.target.value;
                    setSelectedProject({ ...selectedProject, status: newSt });
                    onUpdateProject?.(selectedProject.id, { status: newSt });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="qa_testing">QA Testing</option>
                  <option value="client_review">Client Review</option>
                  <option value="deployment">Deployment</option>
                  <option value="completed">Completed (Delivered)</option>
                </select>
              </div>

              {/* Team Assignment Panel */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-xs">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>Project Leadership & Team Assignment</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Head + Developers + Interns</span>
                </div>

                {/* Assigned Head */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Assigned Lead / Head</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedProject.tech_lead?.full_name || "Department Head"}
                    </span>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 block">
                      {selectedProject.tech_lead?.designation || "VP of Technology"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200 dark:border-orange-900 uppercase">
                    Head / Lead
                  </span>
                </div>

                {/* Assigned Members List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                    Assigned Developers & Interns:
                  </span>
                  {selectedProject.members && selectedProject.members.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedProject.members.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-orange-200 dark:border-orange-900">
                              {(m.profile?.full_name || "M")[0]}
                            </span>
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 dark:text-white block truncate">
                                {m.profile?.full_name || "Team Member"}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {m.profile?.designation || m.role_in_project}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                m.role_in_project === "lead"
                                  ? "bg-orange-50 text-orange-600"
                                  : m.role_in_project === "developer"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              }`}
                            >
                              {m.role_in_project}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberFromProject(m.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                              title="Remove from project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic p-2 bg-white dark:bg-slate-900 rounded-lg">
                      Currently managed by Department Head only. Developers and interns can be assigned below.
                    </p>
                  )}
                </div>

                {/* Add Member Dropdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                  <select
                    value={assigneeUserId}
                    onChange={(e) => setAssigneeUserId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs cursor-pointer"
                  >
                    <option value="">Select Developer / Intern to assign...</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.designation || p.role})
                      </option>
                    ))}
                  </select>
                  <select
                    value={assigneeRole}
                    onChange={(e) => setAssigneeRole(e.target.value)}
                    className="sm:w-28 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs cursor-pointer"
                  >
                    <option value="developer">Developer</option>
                    <option value="intern">Intern</option>
                    <option value="qa">QA</option>
                    <option value="lead">Lead</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignMemberToProject}
                    disabled={!assigneeUserId}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Project Links */}
              <div className="grid grid-cols-2 gap-2">
                {selectedProject.github_repo && (
                  <a
                    href={selectedProject.github_repo}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-neutral-300 hover:text-orange-600"
                  >
                    <GithubIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">GitHub Repository</span>
                  </a>
                )}
                {selectedProject.staging_url && (
                  <a
                    href={selectedProject.staging_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-neutral-300 hover:text-orange-600"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="truncate">Staging URL</span>
                  </a>
                )}
              </div>

              {/* Tasks assigned on this project */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
                  Project Tasks ({tasks.filter((t) => t.project_id === selectedProject.id).length})
                </h4>
                <div className="space-y-1.5">
                  {tasks.filter((t) => t.project_id === selectedProject.id).length > 0 ? (
                    tasks
                      .filter((t) => t.project_id === selectedProject.id)
                      .map((task) => {
                        const assignedDev = profiles.find((p) => p.id === task.assigned_to);
                        return (
                          <div
                            key={task.id}
                            className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 dark:text-white block truncate">
                                {task.title}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                Assigned to: <strong className="text-gray-700 dark:text-slate-300">{assignedDev?.full_name || "Unassigned"}</strong>
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                                task.status === "approved" || task.status === "completed"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">No tasks created yet for this project.</p>
                  )}
                </div>
              </div>

              {selectedProject.status === "completed" && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">Ready for Client Handover?</span>
                    <span className="text-[11px]">Creates handover ticket in Support Module.</span>
                  </div>
                  <button
                    onClick={() => {
                      onHandoverToSupport?.(selectedProject);
                      setSelectedProject(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Handover
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Project</h3>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  placeholder="e.g. Apex Multi-Tenant SaaS Platform"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Client Account
                </label>
                <select
                  value={newProjectForm.client_id}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="">Select Client Account...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company_name || "Client"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Project Head / Tech Lead
                </label>
                <select
                  value={newProjectForm.tech_lead_id}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, tech_lead_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value="">Select Department Head / Tech Lead...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.designation || p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={newProjectForm.budget}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, budget: e.target.value })}
                    placeholder="185000"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newProjectForm.target_date}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, target_date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Project Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={newProjectForm.description}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, description: e.target.value })
                  }
                  placeholder="Scope, deliverables, architecture stack..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
