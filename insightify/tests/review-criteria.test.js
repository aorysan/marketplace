const { describe, test, before } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Review Criteria (Quality Dimensions)', () => {
  const criteriaPath = path.join(__dirname, '../skills/reviewer/references/review-criteria.md');
  const skillPath = path.join(__dirname, '../skills/reviewer/SKILL.md');

  let criteriaContent = '';
  let skillContent = '';

  before(() => {
    if (fs.existsSync(criteriaPath)) {
      criteriaContent = fs.readFileSync(criteriaPath, 'utf8');
    }
    if (fs.existsSync(skillPath)) {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    }
  });

  const EXPECTED_DIMENSIONS = [
    'Accuracy',
    'Completeness',
    'Consistency',
    'Structure',
    'Usability',
    'Type Safety',
    'Architecture Alignment',
    'Business Alignment',
    'Scannability'
  ];

  test('review-criteria.md exists and covers all quality dimensions', () => {
    assert.strictEqual(fs.existsSync(criteriaPath), true, 'review-criteria.md must exist');
    EXPECTED_DIMENSIONS.forEach(dim => {
      assert.strictEqual(criteriaContent.includes(dim), true, `Must include dimension: ${dim}`);
    });
  });

  test('review-criteria.md defines detailed scoring rubric (1, 3, 5) for all quality dimensions', () => {
    assert.ok(criteriaContent.includes('## Scoring Rubric (1-5 per dimension)'), 'Must include scoring rubric header');

    EXPECTED_DIMENSIONS.forEach(dim => {
      assert.ok(criteriaContent.includes(`**${dim}**`), `Rubric must include section for ${dim}`);
    });

    // Check specific rubric points
    assert.ok(criteriaContent.includes('All facts match, no unsupported claims'));
    assert.ok(criteriaContent.includes('All planned sections present and substantive'));
    assert.ok(criteriaContent.includes('Terminology, tone, formatting uniform'));
    assert.ok(criteriaContent.includes('Heading levels incremental, all internal links valid'));
    assert.ok(criteriaContent.includes('Clear code examples, approachable prose'));
    assert.ok(criteriaContent.includes('All interfaces valid, no `any` without justification, strict mode compatible'));
    assert.ok(criteriaContent.includes('All documented patterns match the extracted knowledge base; no fabricated or assumed patterns'));
  });

  test('review-criteria.md defines verdict thresholds and safety valve', () => {
    assert.ok(criteriaContent.includes('Report Verdicts:'), 'Must specify Report Verdicts');
    assert.ok(/`approved`: All \d+ dimensions ≥3, no critical issues\./.test(criteriaContent), 'Must define approved criteria');
    assert.ok(criteriaContent.includes('`changes_needed`: Any dimension <3 OR any critical issue.'), 'Must define changes_needed criteria');
    assert.ok(criteriaContent.includes('Safety Valve:'), 'Must define Safety Valve');
    assert.ok(criteriaContent.includes('Max 3 iteration loops. After 3 loops, escalate remaining issues to user.'), 'Must limit iteration loops to 3');
  });

  test('review-criteria.md specifies architecture alignment against extracted knowledge base', () => {
    assert.ok(criteriaContent.includes('actual architectural patterns as extracted in the knowledge base'), 'Must check actual architectural patterns from KB');
    assert.ok(criteriaContent.includes('state management, routing, API layer, component structure, cross-cutting concerns'), 'Must check architecture categories');
    assert.ok(criteriaContent.includes('matches extracted knowledge base'), 'Must check scoring rubric header');
    assert.ok(criteriaContent.includes('All documented patterns match the extracted knowledge base'), 'Must check 5-score rubric');
    assert.ok(criteriaContent.includes('Documentation describes patterns not found in the codebase'), 'Must check 1-score rubric');
  });

  test('reviewer skill defines quality dimensions and stage 3 in SKILL.md', () => {
    assert.strictEqual(fs.existsSync(skillPath), true, 'reviewer SKILL.md must exist');
    assert.strictEqual(skillContent.includes('name: reviewer'), true, 'Must specify name: reviewer');
    assert.strictEqual(skillContent.includes('Stage 3'), true, 'Must specify Stage 3');
    assert.strictEqual(/\d+ quality dimensions/.test(skillContent), true, 'Must mention numbered quality dimensions');
    assert.strictEqual(skillContent.includes('Type Safety'), true, 'Must mention Type Safety');
    assert.strictEqual(skillContent.includes('Architecture Alignment'), true, 'Must mention Architecture Alignment');
  });

  test('reviewer skill defines instructions and output paths in SKILL.md', () => {
    assert.ok(skillContent.includes('[OUT_DIR]/docs/markdown/documentation.md'), 'Must evaluate markdown docs in docs/markdown/documentation.md');
    assert.ok(skillContent.includes('[OUT_DIR]/.insightify/knowledge/*'), 'Must evaluate against knowledge base in .insightify/knowledge/*');
    assert.ok(skillContent.includes('[OUT_DIR]/.insightify/plan.md'), 'Must evaluate against plan in .insightify/plan.md');
    assert.ok(skillContent.includes('references/review-criteria.md'), 'Must reference review-criteria.md');
    assert.ok(skillContent.includes('[OUT_DIR]/.insightify/review/review-report.md'), 'Must write report to .insightify/review/review-report.md');
    assert.ok(skillContent.includes('changes_needed'), 'Must handle changes_needed verdict');
    assert.ok(skillContent.includes('escalate remaining issues to user'), 'Must escalate on 3 iterations');
    assert.ok(skillContent.includes('Approve doc? [Y/n/revise]'), 'SKILL.md must specify user approval prompt for final document');
  });

  test('reviewer skill defines scoring rubric and issue classifications in SKILL.md', () => {
    EXPECTED_DIMENSIONS.forEach(dim => {
      assert.ok(skillContent.includes(`**${dim}**`), `SKILL.md rubric must include ${dim}`);
    });

    assert.ok(skillContent.includes('## Verdict Thresholds'), 'Must define verdict thresholds');
    assert.ok(/- `approved`: All \d+ dimensions ≥3, no critical issues/.test(skillContent), 'Must define approved threshold');
    assert.ok(skillContent.includes('- `changes_needed`: Any dimension <3 OR any critical issue'), 'Must define changes_needed threshold');

    assert.ok(skillContent.includes('## Issue Classification'), 'Must define issue classification');
    assert.ok(skillContent.includes('TypeScript errors'), 'Critical issues must include TypeScript errors');
    assert.ok(skillContent.includes('architecture violations'), 'Critical issues must include architecture violations');
  });

  test('reviewer skill defines structured issue format for Writer with all dimensions in SKILL.md', () => {
    assert.ok(skillContent.includes('## Issue Format for Writer'), 'Must define issue format for writer');
    assert.ok(skillContent.includes('### Issue: [Short description]'), 'Must include issue title');
    assert.ok(skillContent.includes('- **Location:** `[OUT_DIR]/docs/markdown/documentation.md`'), 'Must specify page path');
    assert.ok(skillContent.includes('- **Dimension:** [Accuracy|Completeness|Consistency|Structure|Usability|Type Safety|Architecture Alignment|Business Alignment|Scannability|Brevity]'), 'Must list all dimensions');
    assert.ok(skillContent.includes('- **Severity:** [Critical|Minor]'), 'Must specify severity');
    assert.ok(skillContent.includes('- **Issue:** [Description of what\'s wrong]'), 'Must specify issue description');
    assert.ok(skillContent.includes('- **Suggestion:** [How to fix it]'), 'Must specify suggestion');
  });

  test('reviewer skill dictates distributing evaluations to concurrent sub-agents', () => {
    assert.ok(skillContent.includes('sub-agents running concurrently'), 'Must mandate concurrent sub-agents for evaluation');
    assert.ok(skillContent.includes('Merge the results/reports from the concurrently running sub-agents'), 'Must mandate merging sub-agent reports');
  });
});
