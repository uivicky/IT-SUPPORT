import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { initGA, trackPageView } from './utils/analytics';
import { DOMAIN_GUIDES } from './data/issuesIndex';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { IssuesListPage } from './pages/IssuesListPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { DomainGuidePage } from './pages/DomainGuidePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { CommandsPage } from './pages/CommandsPage';
import { NetworkingToolsPage } from './pages/NetworkingToolsPage';
import { InterviewPage } from './pages/InterviewPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { BeginnersPage } from './pages/BeginnersPage';
import { LearningLabPage } from './pages/LearningLabPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { SimulatorPage } from './pages/SimulatorPage';
import {
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/StaticPages';

function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    const fullPath = `${pathname}${search}`;
    trackPageView(fullPath, document.title);
  }, [pathname, search]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-mono text-sm font-semibold text-[#27d3f0]">HTTP 404</p>
      <h1 className="mt-2 font-['Sora',sans-serif] text-3xl font-bold text-white">
        Page Not Found
      </h1>
      <p className="mt-3 text-slate-400">
        The page you requested does not exist. Jump back to Beginner Lessons, Visual Lab, or the 325+ IT Knowledge Base.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d]"
        >
          Go to Home
        </Link>
        <Link
          to="/beginners"
          className="rounded-lg border border-[#242c46] bg-[#0d101b] px-5 py-2.5 text-sm font-medium text-white hover:border-[#27d3f0]"
        >
          Start Beginner Lessons
        </Link>
        <Link
          to="/issues"
          className="rounded-lg border border-[#242c46] bg-[#0d101b] px-5 py-2.5 text-sm font-medium text-white hover:border-[#8b6cff]"
        >
          Browse All 325+ Issues
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beginners" element={<BeginnersPage />} />
          <Route path="/learning-lab" element={<LearningLabPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/issues" element={<IssuesListPage />} />
          <Route path="/quick-desk" element={<IssuesListPage defaultView="desk" />} />
          <Route path="/issues/:slug" element={<IssueDetailPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />

          {/* 7 Dedicated Platform Troubleshooting Guides */}
          <Route
            path="/windows-troubleshooting"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.windows} />}
          />
          <Route
            path="/networking-solutions"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.networking} />}
          />
          <Route
            path="/active-directory-guide"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.activeDirectory} />}
          />
          <Route
            path="/microsoft-365-guide"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.microsoft365} />}
          />
          <Route
            path="/windows-server-guide"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.windowsServer} />}
          />
          <Route
            path="/linux-troubleshooting"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.linux} />}
          />
          <Route
            path="/azure-cloud-guide"
            element={<DomainGuidePage guide={DOMAIN_GUIDES.azureCloud} />}
          />

          {/* Interactive Tools, CLI Library, Interview Prep & Career Roadmap */}
          <Route path="/commands" element={<CommandsPage />} />
          <Route path="/networking-tools" element={<NetworkingToolsPage />} />
          <Route path="/interview-questions" element={<InterviewPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />

          {/* Informational & Legal Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
