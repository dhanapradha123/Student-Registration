import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Download,
  FileCheck2,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';

const companies = [
  { name: 'Wipro', sector: 'Technology', color: 'wipro', mark: 'W' },
  { name: 'HCLTech', sector: 'Technology', color: 'hcl', mark: 'H' },
  { name: 'Accenture', sector: 'Consulting', color: 'accenture', mark: 'A' },
  { name: 'TCS', sector: 'Technology', color: 'tcs', mark: 'T' },
  { name: 'Infosys', sector: 'Technology', color: 'infosys', mark: 'I' },
  { name: 'Cognizant', sector: 'Technology', color: 'cognizant', mark: 'C' },
  { name: 'Capgemini', sector: 'Consulting', color: 'capgemini', mark: 'C' },
  { name: 'IBM', sector: 'Technology', color: 'ibm', mark: 'I' },
  { name: 'Deloitte', sector: 'Consulting', color: 'deloitte', mark: 'D' },
  { name: 'Tech Mahindra', sector: 'Technology', color: 'techm', mark: 'T' },
];

const emptyForm = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  fatherName: '',
  motherName: '',
  phone: '',
  email: '',
  arrears: '0',
};

const departments = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering', 'AI & Data Science', 'Other'];
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function Field({ label, name, value, onChange, type = 'text', placeholder, required = true, options, ...props }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <i>*</i>}</span>
      {options ? (
        <span className="select-wrap">
          <select name={name} value={value} onChange={onChange} required={required} {...props}>
            <option value="" disabled>Select {label.toLowerCase()}</option>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </span>
      ) : (
        <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} required={required} {...props} />
      )}
    </label>
  );
}

function App() {
  const [view, setView] = useState('student');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminFilter, setAdminFilter] = useState('All companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState('');
  const [notice, setNotice] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStudents() {
      try {
        const response = await fetch(`${apiUrl}/students`, { signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Could not load placement records.');
        }
        setStudents(data);
        setApiError('');
      } catch {
        if (!controller.signal.aborted) {
          setApiError('Could not reach the placement database. Start the API and MongoDB, then retry.');
        }
      } finally {
        if (!controller.signal.aborted) setStudentsLoading(false);
      }
    }

    loadStudents();
    return () => controller.abort();
  }, [loadAttempt]);

  const eligibleCount = students.filter((student) => Number(student.arrears) === 0).length;
  const visibleStudents = students.filter((student) => {
    const matchesCompany = adminFilter === 'All companies' || student.companies.includes(adminFilter);
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [student.name, student.studentId, student.department, student.email].some((value) => value.toLowerCase().includes(term));
    return matchesCompany && matchesSearch;
  });

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function retryConnection() {
    setStudentsLoading(true);
    setApiError('');
    setLoadAttempt((current) => current + 1);
  }

  function continueToPreferences(event) {
    event.preventDefault();
    if (Number(form.arrears) !== 0) return;
    if (students.some((student) => student.studentId.toLowerCase() === form.studentId.trim().toLowerCase())) {
      setNotice('This student ID is already registered. Check the ID or contact your placement coordinator.');
      return;
    }
    setNotice('');
    setStep(2);
  }

  function toggleCompany(name) {
    setSelectedCompanies((current) => current.includes(name)
      ? current.filter((company) => company !== name)
      : current.length < 4 ? [...current, name] : current);
  }

  async function submitRegistration() {
    if (selectedCompanies.length !== 4 || isSubmitting) return;
    const record = {
      ...form,
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      arrears: Number(form.arrears),
      companies: selectedCompanies,
    };
    setNotice('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || 'Registration could not be saved.');
      setStudents((current) => [data, ...current.filter((student) => student._id !== data._id)]);
      setApiError('');
      setRegistered(true);
    } catch (error) {
      setNotice(error instanceof TypeError
        ? 'Could not reach the placement API. Check the server and MongoDB connection, then retry.'
        : error.message || 'Registration could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startAnother() {
    setForm(emptyForm);
    setSelectedCompanies([]);
    setStep(1);
    setRegistered(false);
  }

  function switchView(nextView) {
    setView(nextView);
    setNotice('');
  }

  function exportCsv() {
    const headers = ['Student ID', 'Name', 'Department', 'Year', 'Section', 'Blood group', 'Father', 'Mother', 'Phone', 'Email', 'Standing arrears', 'Companies'];
    const rows = visibleStudents.map((student) => [student.studentId, student.name, student.department, student.year, student.section, student.bloodGroup, student.fatherName, student.motherName, student.phone, student.email, student.arrears, student.companies.join('; ') ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'placement-students.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => switchView('student')} aria-label="Northstar home">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>northstar</strong><small>CAREER SERVICES</small></span>
        </a>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${view === 'student' ? 'active' : ''}`} aria-label="Student registration" onClick={() => switchView('student')}>
            <ClipboardList size={18} strokeWidth={1.8} /><span>Student registration</span>
            {view === 'student' && <span className="nav-indicator" />}
          </button>
          <button className={`nav-item ${view === 'admin' ? 'active' : ''}`} aria-label="Admin directory" onClick={() => switchView('admin')}>
            <LayoutDashboard size={18} strokeWidth={1.8} /><span>Admin directory</span>
            {view === 'admin' && <span className="nav-indicator" />}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon"><CircleHelp size={17} /></div>
            <div><strong>Need a hand?</strong><span>Talk to your placement cell.</span></div>
            <a href="mailto:placements@college.edu" aria-label="Email placement cell"><ArrowRight size={16} /></a>
          </div>
          <div className="user-profile">
            <div className="avatar">PS</div>
            <div className="profile-copy"><strong>Placement office</strong><span>Coordinator account</span></div>
            <button className="more-button" aria-label="Account options"><span /><span /><span /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Placement desk</span><span className="crumb-slash">/</span><strong>{view === 'student' ? 'Student registration' : 'Admin directory'}</strong></div>
          <div className="topbar-right"><span className="cycle-label"><span className="cycle-dot" />2026 — 27 placements</span><span className="topbar-divider" /><button className="help-button" aria-label="Help"><CircleHelp size={18} /></button></div>
        </header>

        {view === 'student' ? (
          <section className="content-wrap student-view" key="student">
            <div className="page-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" />YOUR CAREER, IN MOTION</div>
                <h1>Make room for<br /><em>what's next.</em></h1>
                <p className="page-intro">Your placement journey starts with a few details.<br className="desktop-break" /> Tell us where you are, then choose where you want to go.</p>
              </div>
              <div className="heading-stamp"><span className="stamp-ring"><Sparkles size={20} /></span><span>CLASS OF<br /><strong>2027</strong></span></div>
            </div>

            <div className="registration-layout">
              <div className="form-column">
                <div className="stepper" aria-label="Registration progress">
                  <div className={`step-marker ${step === 1 ? 'current' : 'complete'}`}><span>{step > 1 ? <Check size={15} /> : '01'}</span><div><strong>Your profile</strong><small>About you</small></div></div>
                  <div className={`step-connector ${step > 1 ? 'complete' : ''}`} />
                  <div className={`step-marker ${step === 2 ? 'current' : ''}`}><span>02</span><div><strong>Company choices</strong><small>Your shortlist</small></div></div>
                </div>

                {registered ? (
                  <div className="success-panel">
                    <span className="success-icon"><BadgeCheck size={29} /></span>
                    <div className="eyebrow"><span className="eyebrow-line" />YOU'RE ON YOUR WAY</div>
                    <h2>Registration<br /><em>complete.</em></h2>
                    <p>Your profile is in. Your four company preferences have been shared with the placement office.</p>
                    <div className="success-summary"><span>{form.studentId}</span><span>{selectedCompanies.join(' · ')}</span></div>
                    <button className="text-action" onClick={startAnother}>Register another student <ArrowRight size={16} /></button>
                  </div>
                ) : step === 1 ? (
                  <form className="form-panel" onSubmit={continueToPreferences}>
                    <div className="section-title-row"><div><span className="section-kicker">01 / YOUR PROFILE</span><h2>The essentials</h2></div><span className="required-note"><i>*</i> Required</span></div>
                    {(notice || apiError) && <div className="notice error-notice api-notice" role="alert"><span>{notice || apiError}</span>{apiError && <button type="button" className="text-action" onClick={retryConnection}>Retry connection</button>}</div>}
                    <div className="form-grid">
                      <Field label="Full name" name="name" value={form.name} onChange={updateForm} placeholder="As on college records" autoComplete="name" />
                      <Field label="Student ID" name="studentId" value={form.studentId} onChange={updateForm} placeholder="e.g. 21CS104" />
                      <Field label="Department" name="department" value={form.department} onChange={updateForm} options={departments} />
                      <div className="field-pair">
                        <Field label="Year" name="year" value={form.year} onChange={updateForm} options={['1st year', '2nd year', '3rd year', '4th year']} />
                        <Field label="Section" name="section" value={form.section} onChange={updateForm} options={['A', 'B', 'C', 'D', 'Other']} />
                      </div>
                      <Field label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={updateForm} options={['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']} />
                      <Field label="Phone number" name="phone" value={form.phone} onChange={updateForm} type="tel" placeholder="+91 00000 00000" autoComplete="tel" inputMode="tel" />
                      <Field label="Email address" name="email" value={form.email} onChange={updateForm} type="email" placeholder="you@college.edu" autoComplete="email" />
                      <Field label="Father's name" name="fatherName" value={form.fatherName} onChange={updateForm} placeholder="Full name" />
                      <Field label="Mother's name" name="motherName" value={form.motherName} onChange={updateForm} placeholder="Full name" />
                      <div className="field arrears-field">
                        <span className="field-label">Standing arrears<i>*</i></span>
                        <div className="arrears-control"><button type="button" onClick={() => setForm((current) => ({ ...current, arrears: String(Math.max(0, Number(current.arrears || 0) - 1)) }))} aria-label="Decrease standing arrears">−</button><input aria-label="Number of standing arrears" name="arrears" type="number" min="0" max="99" value={form.arrears} onChange={updateForm} required /><button type="button" onClick={() => setForm((current) => ({ ...current, arrears: String(Math.min(99, Number(current.arrears || 0) + 1)) }))} aria-label="Increase standing arrears">+</button></div>
                        <span className={`eligibility-hint ${Number(form.arrears) === 0 ? 'eligible' : ''}`}><span />{Number(form.arrears) === 0 ? 'Eligible for company preferences' : 'Clear all standing arrears to continue'}</span>
                      </div>
                    </div>
                    <div className="form-footer"><span><ShieldCheck size={15} />{apiError ? 'Database connection unavailable.' : studentsLoading ? 'Connecting to the placement database...' : 'Connected to the placement database.'}</span><button className="primary-button" type="submit" disabled={Number(form.arrears) !== 0}>Continue <ArrowRight size={17} /></button></div>
                  </form>
                ) : (
                  <div className="form-panel preference-panel">
                    <div className="section-title-row"><div><span className="section-kicker">02 / YOUR SHORTLIST</span><h2>Choose your four</h2></div><span className="choice-count"><strong>{selectedCompanies.length}</strong> / 4 selected</span></div>
                    <p className="preference-intro">Pick the companies you'd be excited to meet. You can choose exactly four.</p>
                    {(notice || apiError) && <div className="notice error-notice api-notice" role="alert"><span>{notice || apiError}</span>{apiError && <button type="button" className="text-action" onClick={retryConnection}>Retry connection</button>}</div>}
                    <div className="company-grid">
                      {companies.map((company, index) => {
                        const selected = selectedCompanies.includes(company.name);
                        const locked = selectedCompanies.length === 4 && !selected;
                        return <button key={company.name} className={`company-option ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`} onClick={() => toggleCompany(company.name)} type="button" aria-pressed={selected} disabled={locked}>
                          <span className={`company-mark ${company.color}`}>{company.mark}</span><span className="company-detail"><strong>{company.name}</strong><small>{company.sector}</small></span><span className="company-check">{selected && <Check size={14} />}</span>
                        </button>;
                      })}
                    </div>
                    <div className="preference-footer"><button className="back-button" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back to profile</button><button className="primary-button" disabled={selectedCompanies.length !== 4 || isSubmitting} onClick={submitRegistration}>{isSubmitting ? 'Saving...' : 'Submit registration'} {!isSubmitting && <ArrowRight size={17} />}</button></div>
                  </div>
                )}
              </div>

              <aside className="journey-aside">
                <div className="aside-art"><div className="art-sun" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-path"><span /><span /><span /></div><span className="art-label">YOUR<br />NEXT</span><span className="art-coordinate">12°58' N<br />77°35' E</span></div>
                <div className="aside-note"><span className="note-number">01</span><div><strong>A clear first step.</strong><p>Build your student profile, then shape a shortlist that feels like you.</p></div></div>
                <div className="aside-rule" />
                <div className="aside-fact"><div className="fact-icon"><BriefcaseBusiness size={17} /></div><div><strong>10 leading employers</strong><span>Four choices. One exciting start.</span></div></div>
                <div className="aside-fact"><div className="fact-icon"><FileCheck2 size={17} /></div><div><strong>One simple requirement</strong><span>No standing arrears to proceed.</span></div></div>
                <div className="aside-footnote">A LITTLE PREPARATION GOES A LONG WAY <span>✳</span></div>
              </aside>
            </div>
          </section>
        ) : (
          <section className="content-wrap admin-view" key="admin">
            <div className="admin-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" />PLACEMENT OFFICE</div><h1>The student<br /><em>directory.</em></h1><p className="page-intro">Every shortlist, in one place. Select a company to see who's interested.</p></div>
              <div className="admin-heading-actions"><button className="secondary-button" onClick={exportCsv} disabled={visibleStudents.length === 0}><Download size={16} /> Export list</button><span className="admin-avatar"><UsersRound size={19} /></span></div>
            </div>

            <div className="metric-strip">
              <div className="metric"><span className="metric-icon green"><UsersRound size={17} /></span><div><span>TOTAL REGISTERED</span><strong>{String(students.length).padStart(2, '0')}</strong></div></div>
              <div className="metric"><span className="metric-icon amber"><BadgeCheck size={17} /></span><div><span>ELIGIBLE STUDENTS</span><strong>{String(eligibleCount).padStart(2, '0')}</strong></div></div>
              <div className="metric"><span className="metric-icon coral"><Building2 size={17} /></span><div><span>COMPANIES OPEN</span><strong>10</strong></div></div>
              <div className="metric-caption"><span className="caption-spark">✳</span> A sharper view of<br />what comes next.</div>
            </div>

            <div className="directory-panel">
              <div className="directory-topline"><div><span className="section-kicker">THE TALENT POOL</span><h2>Company directory</h2></div><span className="directory-total">{visibleStudents.length} {visibleStudents.length === 1 ? 'student' : 'students'}</span></div>
              <div className="directory-toolbar"><div className="company-filter"><Filter size={15} /><select aria-label="Filter by company" value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)}><option>All companies</option>{companies.map((company) => <option key={company.name}>{company.name}</option>)}</select><ChevronDown size={14} /></div><label className="search-box"><Search size={16} /><input placeholder="Search students" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><kbd>⌘ K</kbd></label></div>
              {visibleStudents.length > 0 ? (
                <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>DEPARTMENT</th><th>YEAR / SEC</th><th>STANDING ARREARS</th><th>COMPANY CHOICES</th><th aria-label="Actions" /></tr></thead><tbody>{visibleStudents.map((student) => <React.Fragment key={student.studentId}><tr><td><div className="student-cell"><span className="student-avatar">{student.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{student.name}</strong><small>{student.studentId} · {student.email}</small></span></div></td><td><span className="department-cell">{student.department}</span></td><td><span className="year-cell">{student.year} <i>·</i> {student.section}</span></td><td><span className={`arrears-badge ${Number(student.arrears) === 0 ? 'clear' : 'has-arrears'}`}><span />{student.arrears} {Number(student.arrears) === 1 ? 'arrear' : 'arrears'}</span></td><td><div className="company-tags">{student.companies.map((company) => <span key={company}>{company}</span>)}</div></td><td><div className="row-actions"><button className="detail-toggle" type="button" aria-expanded={expandedStudentId === student.studentId} aria-label={`${expandedStudentId === student.studentId ? 'Hide' : 'View'} full profile for ${student.name}`} onClick={() => setExpandedStudentId((current) => current === student.studentId ? '' : student.studentId)}><ChevronDown size={15} /></button><a className="email-link" href={`mailto:${student.email}`} aria-label={`Email ${student.name}`}><Mail size={16} /></a></div></td></tr>{expandedStudentId === student.studentId && <tr className="details-row"><td colSpan="6"><div className="record-details"><div><span>PHONE NUMBER</span><strong>{student.phone}</strong></div><div><span>BLOOD GROUP</span><strong>{student.bloodGroup}</strong></div><div><span>EMAIL ADDRESS</span><strong>{student.email}</strong></div><div><span>FATHER'S NAME</span><strong>{student.fatherName}</strong></div><div><span>MOTHER'S NAME</span><strong>{student.motherName}</strong></div></div></td></tr>}</React.Fragment>)}</tbody></table></div>
              ) : (
                <div className="empty-state"><div className="empty-art"><span><GraduationCap size={28} /></span><i /><i /><i /></div><h3>{studentsLoading ? 'Connecting to the placement desk.' : apiError ? 'Directory connection unavailable.' : students.length === 0 ? 'The first story starts here.' : 'No students in this view.'}</h3><p>{studentsLoading ? 'Loading student records from MongoDB.' : apiError ? apiError : students.length === 0 ? 'Once students complete registration, their company preferences will appear here.' : 'Try another company or clear your search to see more students.'}</p>{apiError ? <button className="text-action" onClick={retryConnection}>Retry connection <ArrowRight size={16} /></button> : students.length === 0 && !studentsLoading && <button className="text-action" onClick={() => switchView('student')}>Go to student registration <ArrowRight size={16} /></button>}</div>
              )}
              <div className="table-footer"><span><span className="live-dot" /> LIVE REGISTRATION DATA</span><span>2026 — 27 PLACEMENT CYCLE <span className="footer-star">✳</span></span></div>
            </div>
            <div className="admin-bottom-note"><span><ShieldCheck size={15} /> MongoDB-backed prototype. Add authentication before handling real student records.</span><button onClick={() => { setAdminFilter('All companies'); setSearchTerm(''); }}><X size={14} /> Clear filters</button></div>
          </section>
        )}

        <footer className="app-footer"><span>© 2026 NORTHSTAR CAREER SERVICES</span><span>BUILT FOR WHAT'S NEXT <span className="footer-star">✳</span></span></footer>
      </main>
    </div>
  );
}

export default App;
