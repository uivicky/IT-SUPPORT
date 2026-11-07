import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_CATEGORIES, ALL_ISSUES } from '../data/issuesIndex';
import { COMMANDS_LIBRARY } from '../data/commandsData';
import {
  INTERVIEW_QUESTIONS,
  INTERVIEW_TRACKS,
  LEARNING_ROADMAP,
} from '../data/interviewAndRoadmapData';
import { BEGINNER_LESSONS } from '../data/beginnerLessonsData';
import { VISUAL_LEARNING_LABS } from '../data/learningLabData';
import { getQuestionsForMode, QUIZ_MODES } from '../data/quizzesData';
import { SIMULATOR_SCENARIOS } from '../data/simulatorData';
import {
  calculateSubnet,
  cidrToSubnetMask,
  isValidIpv4,
  subnetMaskToCidr,
} from './networkCalc';
import { getRelatedIssues, getSearchSuggestions, searchIssues } from './searchEngine';
import {
  BADGE_CATALOG,
  createInitialProgressState,
  getLevelInfo,
  recordCommandPracticed,
  recordLessonCompleted,
  recordQuizCompleted,
  recordScenarioSolved,
  updateStreakForDate,
} from './gamification';
import { executeSimulatedCommand } from './terminalSimulator';

describe('IT SUPPORT Knowledge Base Integrity', () => {
  it('contains 300+ unique IT troubleshooting issues across all 25 categories', () => {
    assert.ok(
      ALL_ISSUES.length >= 300,
      `Expected >= 300 issues, found ${ALL_ISSUES.length}`
    );
    assert.equal(ALL_CATEGORIES.length, 25);

    const ids = new Set<string>();
    const slugs = new Set<string>();
    const titles = new Set<string>();
    const categoryCounts = new Map<string, number>();

    for (const issue of ALL_ISSUES) {
      assert.ok(!ids.has(issue.id), `Duplicate issue ID: ${issue.id}`);
      assert.ok(!slugs.has(issue.slug), `Duplicate issue slug: ${issue.slug}`);
      assert.ok(
        !titles.has(issue.title.toLowerCase()),
        `Duplicate issue title: ${issue.title}`
      );

      ids.add(issue.id);
      slugs.add(issue.slug);
      titles.add(issue.title.toLowerCase());
      categoryCounts.set(issue.category, (categoryCounts.get(issue.category) || 0) + 1);

      assert.ok(issue.title.length > 5, `Short title on ${issue.id}`);
      assert.ok(issue.shortDescription.length > 10, `Short description on ${issue.id}`);
      assert.ok(issue.symptoms.length >= 2, `Insufficient symptoms on ${issue.id}`);
      assert.ok(issue.possibleCauses.length >= 2, `Insufficient causes on ${issue.id}`);
      assert.ok(issue.solutionSteps.length >= 3, `Insufficient steps on ${issue.id}`);
      assert.ok(issue.commands.length >= 1, `Missing CLI commands on ${issue.id}`);
      assert.ok(issue.expectedResult.length > 5, `Missing expected result on ${issue.id}`);
      assert.ok(issue.preventionTips.length >= 1, `Missing prevention tips on ${issue.id}`);
      assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(issue.difficulty));
      assert.ok(issue.estimatedTime.length > 2, `Missing estimated time on ${issue.id}`);
    }

    for (const cat of ALL_CATEGORIES) {
      const count = categoryCounts.get(cat) || 0;
      assert.ok(count >= 12, `Category "${cat}" has only ${count} issues (expected >= 12)`);
    }
  });

  it('covers all 11 interview tracks, commands library, and 3 roadmap levels', () => {
    assert.ok(COMMANDS_LIBRARY.length >= 25);
    assert.equal(INTERVIEW_TRACKS.length, 11);
    for (const track of INTERVIEW_TRACKS) {
      const count = INTERVIEW_QUESTIONS.filter((q) => q.track === track).length;
      assert.ok(count >= 4, `Interview track "${track}" has only ${count} questions`);
    }
    assert.equal(LEARNING_ROADMAP.length, 3);
  });
});

describe('Interactive Learning Upgrade Datasets & Engines', () => {
  it('provides all 25 Beginner Lessons with flow diagrams, Hinglish, and 3-question mini quizzes', () => {
    assert.equal(BEGINNER_LESSONS.length, 25);
    const ids = new Set<string>();
    BEGINNER_LESSONS.forEach((lesson, idx) => {
      assert.equal(lesson.number, idx + 1);
      assert.ok(!ids.has(lesson.id), `Duplicate lesson ID ${lesson.id}`);
      ids.add(lesson.id);
      assert.ok(lesson.simpleExplanation.length > 20);
      assert.ok(lesson.hinglishExplanation.length > 15);
      assert.ok(lesson.flowNodes.length >= 3);
      assert.equal(lesson.miniQuiz.length, 3);
    });
  });

  it('provides all 8 Visual IT Learning Lab simulations and 10 Real-World IT Simulator scenarios', () => {
    assert.equal(VISUAL_LEARNING_LABS.length, 8);
    for (const lab of VISUAL_LEARNING_LABS) {
      assert.ok(lab.stages.length >= 4, `Lab ${lab.id} should have >= 4 stages`);
    }

    assert.equal(SIMULATOR_SCENARIOS.length, 10);
    for (const sc of SIMULATOR_SCENARIOS) {
      assert.equal(sc.steps.length, 2);
      for (const st of sc.steps) {
        assert.ok(st.options.some((o) => o.isCorrect));
        assert.ok(st.options.some((o) => !o.isCorrect));
      }
    }
  });

  it('supports all 8 Quiz Modes including deterministic Daily IT Challenge', () => {
    assert.equal(QUIZ_MODES.length, 8);
    for (const mode of QUIZ_MODES) {
      const qs = getQuestionsForMode(mode.id, '2026-10-31');
      assert.equal(qs.length, 5, `Quiz mode ${mode.id} should return 5 questions`);
    }
    const dailyA = getQuestionsForMode('daily', '2026-10-31').map((q) => q.id);
    const dailyB = getQuestionsForMode('daily', '2026-10-31').map((q) => q.id);
    assert.deepEqual(dailyA, dailyB);
  });

  it('enforces strictly earned-only badges, XP levels, and daily streaks', () => {
    let state = createInitialProgressState();
    assert.equal(state.xp, 0);
    assert.equal(state.earnedBadgeIds.length, 0, 'Zero badges may be pre-awarded at start');
    assert.equal(BADGE_CATALOG.length, 6);

    // First lesson unlocks First Step
    const step1 = recordLessonCompleted(state, 'what-is-a-computer', '2026-10-30');
    state = step1.nextState;
    assert.equal(state.xp, 30);
    assert.equal(state.streakDays, 1);
    assert.ok(state.earnedBadgeIds.includes('first-step'));

    // Next consecutive day increments streak
    const streakCheck = updateStreakForDate(state, '2026-10-31');
    assert.equal(streakCheck.streakDays, 2);

    // Practicing 5 unique CLI commands unlocks Command Master
    for (const cmd of ['ipconfig', 'ping', 'nslookup', 'tracert', 'df -h']) {
      state = recordCommandPracticed(state, cmd, '2026-10-31').nextState;
    }
    assert.ok(state.earnedBadgeIds.includes('command-master'));

    // Solving 3 simulator tickets unlocks IT Problem Solver
    for (const ticket of ['no-internet', 'dns-failure', 'printer-offline']) {
      state = recordScenarioSolved(state, ticket, true, '2026-10-31').nextState;
    }
    assert.ok(state.earnedBadgeIds.includes('it-problem-solver'));

    // Passing Networking Quiz (5/5) unlocks Networking Explorer
    state = recordQuizCompleted(state, 'networking', 5, 5, '2026-10-31').nextState;
    assert.ok(state.earnedBadgeIds.includes('networking-explorer'));

    const lvl = getLevelInfo(state.xp);
    assert.ok(lvl.level >= 2);

    // Verify 3 networking beginner lessons also unlock Networking Explorer independently
    let lessonNetState = createInitialProgressState();
    for (const lid of ['what-is-an-ip-address', 'what-is-dns', 'what-is-dhcp']) {
      lessonNetState = recordLessonCompleted(lessonNetState, lid, '2026-10-31').nextState;
    }
    assert.ok(lessonNetState.earnedBadgeIds.includes('networking-explorer'));
  });

  it('provides all 13 Networking Visual Lessons and 13 Connected Roadmap Stages with XP toggle', async () => {
    const { NETWORKING_VISUAL_LESSONS, ROADMAP_13_STAGES } = await import(
      '../data/networkingLessonsAndRoadmap13'
    );
    const { recordRoadmapStageToggled } = await import('./gamification');

    assert.equal(NETWORKING_VISUAL_LESSONS.length, 13);
    for (const nl of NETWORKING_VISUAL_LESSONS) {
      assert.equal(nl.packetFlow.length, 4);
      assert.ok(nl.simpleExplanation.length > 20);
    }

    assert.equal(ROADMAP_13_STAGES.length, 13);
    ROADMAP_13_STAGES.forEach((st, idx) => {
      assert.equal(st.stageNumber, idx + 1);
      assert.ok(st.lessonLink.to.startsWith('/'));
      assert.ok(st.quizLink.to.startsWith('/'));
      assert.ok(st.practiceLink.to.startsWith('/'));
    });

    let stState = createInitialProgressState();
    const toggledOn = recordRoadmapStageToggled(
      stState,
      'stage-01-computer-basics',
      '2026-10-31'
    );
    assert.equal(toggledOn.xpGained, 20);
    assert.ok(
      toggledOn.nextState.completedRoadmapStageIds.includes('stage-01-computer-basics')
    );
    assert.ok(toggledOn.nextState.earnedBadgeIds.includes('first-step'));

    const toggledOff = recordRoadmapStageToggled(
      toggledOn.nextState,
      'stage-01-computer-basics',
      '2026-10-31'
    );
    assert.equal(toggledOff.nextState.completedRoadmapStageIds.length, 0);
  });

  it('simulates Windows, PowerShell, and Linux commands safely in Practice Terminal', () => {
    const ipRes = executeSimulatedCommand('ipconfig');
    assert.equal(ipRes.recognized, true);
    assert.match(ipRes.output, /192\.168\.10\.45/);
    assert.ok(ipRes.meaningBreakdown.length >= 2);

    const linuxRes = executeSimulatedCommand('df -h');
    assert.equal(linuxRes.recognized, true);
    assert.equal(linuxRes.shellLabel, 'Linux Bash');

    const clearRes = executeSimulatedCommand('clear');
    assert.equal(clearRes.clearScreen, true);

    const unknownRes = executeSimulatedCommand('rm -rf /');
    assert.equal(unknownRes.recognized, false);
  });
});

describe('Smart Search Engine', () => {
  it('matches issues by hex error code (0x80070005)', () => {
    const results = searchIssues(ALL_ISSUES, { query: '0x80070005' });
    assert.ok(results.length >= 1, 'Expected at least 1 match for 0x80070005');
    const topMatch = results[0];
    assert.ok(
      (topMatch.errorCode || '').toLowerCase().includes('0x80070005') ||
        topMatch.title.toLowerCase().includes('0x80070005')
    );
  });

  it('matches issues by symptom phrase and command strings', () => {
    const wifiResults = searchIssues(ALL_ISSUES, { query: 'WiFi connected no internet' });
    assert.ok(wifiResults.length >= 1);

    const cmdResults = searchIssues(ALL_ISSUES, { query: 'ipconfig /flushdns' });
    assert.ok(cmdResults.length >= 1);
  });

  it('filters accurately by category and difficulty level', () => {
    const linuxAdvanced = searchIssues(ALL_ISSUES, {
      category: 'Linux',
      difficulty: 'Advanced',
    });
    assert.ok(linuxAdvanced.length >= 1);
    for (const item of linuxAdvanced) {
      assert.equal(item.category, 'Linux');
      assert.equal(item.difficulty, 'Advanced');
    }
  });

  it('returns live suggestions and related issues excluding current issue', () => {
    const suggestions = getSearchSuggestions(ALL_ISSUES, 'printer offline', 5);
    assert.ok(suggestions.length >= 1 && suggestions.length <= 5);

    const sample = ALL_ISSUES[0];
    const related = getRelatedIssues(ALL_ISSUES, sample, 4);
    assert.equal(related.length, 4);
    assert.ok(related.every((r) => r.id !== sample.id));
  });
});

describe('IPv4 Subnet & CIDR Calculator', () => {
  it('accurately computes /26 subnet parameters', () => {
    const res = calculateSubnet('192.168.10.45', 26);
    assert.equal(res.valid, true);
    assert.equal(res.subnetMask, '255.255.255.192');
    assert.equal(res.wildcardMask, '0.0.0.63');
    assert.equal(res.networkAddress, '192.168.10.0');
    assert.equal(res.broadcastAddress, '192.168.10.63');
    assert.equal(res.firstUsableHost, '192.168.10.1');
    assert.equal(res.lastUsableHost, '192.168.10.62');
    assert.equal(res.totalAddresses, 64);
    assert.equal(res.usableHosts, 62);
    assert.equal(res.isPrivate, true);
  });

  it('accurately computes /30, /31 RFC 3021 point-to-point, and /32 host routes', () => {
    const slash30 = calculateSubnet('172.16.5.10', 30);
    assert.equal(slash30.networkAddress, '172.16.5.8');
    assert.equal(slash30.firstUsableHost, '172.16.5.9');
    assert.equal(slash30.lastUsableHost, '172.16.5.10');
    assert.equal(slash30.broadcastAddress, '172.16.5.11');
    assert.equal(slash30.usableHosts, 2);

    const slash31 = calculateSubnet('10.255.0.4', 31);
    assert.equal(slash31.usableHosts, 2);
    assert.equal(slash31.firstUsableHost, '10.255.0.4');
    assert.equal(slash31.lastUsableHost, '10.255.0.5');

    const slash32 = calculateSubnet('8.8.8.8', 32);
    assert.equal(slash32.usableHosts, 1);
    assert.equal(slash32.isPrivate, false);
    assert.match(slash32.scopeType, /Public/i);
  });

  it('converts subnet masks to CIDR prefixes and rejects non-contiguous or invalid IPs', () => {
    assert.equal(cidrToSubnetMask(24), '255.255.255.0');
    assert.equal(subnetMaskToCidr('255.255.254.0'), 23);
    assert.equal(subnetMaskToCidr('255.255.0.255'), null);
    assert.equal(isValidIpv4('999.1.1.1'), false);
    assert.equal(isValidIpv4('192.168.01.1'), false);
    assert.equal(calculateSubnet('169.254.10.25', 16).scopeType.includes('APIPA'), true);
  });
});

describe('3D Quick Desk & Inline /api/ai Helpers', () => {
  it('maps all 25 IT categories and AI Assistant to valid 3D stage presets', async () => {
    const {
      STAGE_PRESETS,
      formatDiagnosticAsPlainAnswer,
      getStagePresetForCategory,
      groupIssuesByCategory,
    } = await import('./quickDeskHelpers');

    for (const cat of ALL_CATEGORIES) {
      const preset = getStagePresetForCategory(cat);
      assert.ok(preset && STAGE_PRESETS[preset.id], `Missing 3D preset for ${cat}`);
      assert.ok(preset.label.length > 3);
    }

    assert.equal(getStagePresetForCategory('AI Assistant').id, 'ai');
    assert.equal(getStagePresetForCategory('DNS & DHCP').id, 'network');
    assert.equal(getStagePresetForCategory('Printer & Scanner').id, 'printer');
    assert.equal(getStagePresetForCategory('Laptop & Desktop Hardware').id, 'hardware');
    assert.equal(getStagePresetForCategory('Windows 10 & Windows 11').id, 'windows');

    const grouped = groupIssuesByCategory(ALL_ISSUES);
    assert.equal(grouped.length, 25);
    const totalGrouped = grouped.reduce((acc, g) => acc + g.issues.length, 0);
    assert.equal(totalGrouped, ALL_ISSUES.length);

    const formatted = formatDiagnosticAsPlainAnswer({
      problemSummary: 'DNS resolver cache contains stale records.',
      severity: 'Medium',
      possibleCauses: ['Stale DNS cache', 'ISP resolver outage'],
      steps: ['Flush local DNS cache', 'Test nslookup against 1.1.1.1'],
      commands: [
        {
          command: 'ipconfig /flushdns',
          shell: 'CMD (Admin)',
          description: 'Clears Windows DNS resolver cache',
          safetyWarning: 'Run in elevated Command Prompt',
        },
      ],
      expectedResult: 'Domain names resolve immediately.',
      furtherTroubleshooting: ['Check firewall UDP port 53'],
      followUpQuestions: ['How do I set 8.8.8.8 on Windows 11?'],
    });

    assert.match(formatted, /Summary \(Medium Severity\):/);
    assert.match(formatted, /1\. Flush local DNS cache/);
    assert.match(formatted, /ipconfig \/flushdns/);
    assert.match(formatted, /Expected Result: Domain names resolve immediately\./);
  });
});

describe('Developer Branding & Official WhatsApp Configuration', () => {
  it('exposes exact VICKY VICTORIX branding and single configured WhatsApp URL', async () => {
    const { DEVELOPER_BRANDING, buildWhatsAppUrl } = await import('./developerBranding');

    assert.equal(DEVELOPER_BRANDING.name, 'VICKY');
    assert.equal(DEVELOPER_BRANDING.brandName, 'VICTORIX');
    assert.equal(DEVELOPER_BRANDING.fullCreditName, 'VICKY VICTORIX');
    assert.equal(DEVELOPER_BRANDING.role, 'Website Designer & Developer');
    assert.equal(DEVELOPER_BRANDING.whatsappNumber, '916387661594');
    assert.equal(DEVELOPER_BRANDING.creditHeading, 'Website Designed & Developed By');
    assert.equal(DEVELOPER_BRANDING.ctaLabel, 'Contact Developer on WhatsApp');
    assert.equal(
      DEVELOPER_BRANDING.finalSiteTitle,
      'IT SUPPORT – Your Complete IT Troubleshooting Guide.'
    );
    assert.equal(
      DEVELOPER_BRANDING.finalDeveloperCredit,
      'Designed & Developed By VICKY (VICTORIX).'
    );
    assert.equal(
      DEVELOPER_BRANDING.whatsappUrl,
      'https://wa.me/916387661594?text=Hello%20Vicky%2C%20I%20visited%20your%20IT%20SUPPORT%20website%20and%20would%20like%20to%20connect%20with%20you.'
    );
    assert.equal(
      buildWhatsAppUrl('+91 63876 61594', DEVELOPER_BRANDING.whatsappMessage),
      DEVELOPER_BRANDING.whatsappUrl
    );
  });
});


