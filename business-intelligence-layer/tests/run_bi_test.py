#!/usr/bin/env python3
"""
BI Plugin Test Harness
Tests consistency of business-intelligence-layer plugin outputs.

Usage:
  python tests/run_bi_test.py [--mode manual|auto] [--skill SKILL_NAME] [--all]

Modes:
  manual  - Generate outputs manually (run prompt, save result), then score
  auto    - Attempt automated generation via claude CLI or LLM API

Examples:
  python tests/run_bi_test.py --all                  # Run all skills, manual mode
  python tests/run_bi_test.py --skill business-strategist  # Single skill
  python tests/run_bi_test.py --mode auto --all      # Try automated generation
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional

# Paths
PLUGIN_DIR = Path(__file__).parent.parent
FIXTURES_DIR = PLUGIN_DIR / "tests" / "fixtures"
RUBRICS_DIR = PLUGIN_DIR / "tests" / "rubrics"
OUTPUTS_DIR = PLUGIN_DIR / "tests" / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# Skill definitions
SKILLS = {
    "business-strategist": {
        "input_files": ["product_kb.md", "pitch_deck.md", "pricing.md", "market_notes.md"],
        "output_file": "business_strategist_output.md",
        "rubric_file": "business-strategist-rubric.md",
        "prompt_instruction": "Buatkan Business Knowledge Base untuk produk ini berdasarkan informasi berikut. Gunakan template output yang tersedia di SKILL.md.",
    },
    "business-strategist-reviewer": {
        "input_files": [],  # Takes previous skill output
        "output_file": "business_strategist_reviewer_output.md",
        "rubric_file": "business-strategist-reviewer-rubric.md",
        "depends_on": "business-strategist",
        "prompt_instruction": "Review Business Knowledge Base ini dan buat Business Audit Report. Gunakan template output yang tersedia di SKILL.md.",
    },
    "brand-story-writer": {
        "input_files": [],  # Takes previous skill outputs
        "output_file": "brand_story_writer_output.md",
        "rubric_file": "brand-story-writer-rubric.md",
        "depends_on": ["business-strategist", "business-strategist-reviewer"],
        "prompt_instruction": "Buat Brand Story Guide dari Business Knowledge Base dan Business Audit Report ini. Gunakan template output yang tersedia di SKILL.md.",
    },
}


def load_fixture(filename: str) -> str:
    """Load a fixture file from tests/fixtures/"""
    path = FIXTURES_DIR / filename
    if not path.exists():
        print(f"[ERROR] Fixture not found: {path}")
        return ""
    return path.read_text(encoding="utf-8")


def construct_prompt(skill_name: str, prev_outputs: dict) -> str:
    """Construct the prompt for a skill based on fixtures and previous outputs."""
    skill = SKILLS[skill_name]
    parts = []

    # Add fixture inputs
    for fname in skill["input_files"]:
        content = load_fixture(fname)
        if content:
            parts.append(f"\n\n--- {fname} ---\n{content}")

    # Add previous skill outputs (for chained skills)
    deps = skill.get("depends_on", [])
    if isinstance(deps, str):
        deps = [deps]
    for dep in deps:
        if dep in prev_outputs and prev_outputs[dep]:
            dep_skill = SKILLS[dep]
            parts.append(f"\n\n--- Output {dep}: {dep_skill['output_file']} ---\n{prev_outputs[dep]}")

    prompt = skill["prompt_instruction"]
    prompt += "".join(parts)
    prompt += "\n\nSilakan gunakan template output yang telah ditentukan dan berikan hasil analisis yang lengkap."
    return prompt


def save_output(skill_name: str, content: str) -> Path:
    """Save skill output to outputs directory."""
    skill = SKILLS[skill_name]
    path = OUTPUTS_DIR / skill["output_file"]
    path.write_text(content, encoding="utf-8")
    print(f"[SAVED] Output saved to: {path}")
    return path


def load_output(skill_name: str) -> Optional[str]:
    """Load previously saved output."""
    skill = SKILLS[skill_name]
    path = OUTPUTS_DIR / skill["output_file"]
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def parse_rubric(rubric_path: Path) -> list:
    """Parse rubric file into checklist items.

    Rubric structure:
      ## N. Title
      - [ ] **Y/N:** description
      - [ ] **Partial:** description (optional)
      - [ ] **Evidence:** description

    Returns list of items, each with title, description (from Y/N line),
    and optional partial_description and evidence_description.
    """
    if not rubric_path.exists():
        print(f"[ERROR] Rubric not found: {rubric_path}")
        return []

    content = rubric_path.read_text(encoding="utf-8")
    items = []

    # Match numbered sections: ## N. Title
    section_pattern = re.compile(r'^##\s+\d+\.\s+(.+)$', re.MULTILINE)
    # Match checkbox lines under each section
    checkbox_pattern = re.compile(r'^\s*- \[ \] \*\*(.+?)\*\*:\s*(.+)$', re.MULTILINE)

    # Find all section headers with positions
    sections = []
    for m in section_pattern.finditer(content):
        title = m.group(1).strip()
        start = m.end()
        # Find end of this section (next section or end of file)
        next_match = section_pattern.search(content, start)
        end = next_match.start() if next_match else len(content)
        sections.append((title, content[start:end]))

    for title, section_text in sections:
        # Parse checkbox lines in this section
        y_n_desc = ""
        partial_desc = ""
        evidence_desc = ""
        for cm in checkbox_pattern.finditer(section_text):
            label = cm.group(1).strip()
            desc = cm.group(2).strip()
            if label.upper() == "Y/N":
                y_n_desc = desc
            elif label.upper() == "PARTIAL":
                partial_desc = desc
            elif label.upper() == "EVIDENCE":
                evidence_desc = desc

        items.append({
            "title": title,
            "description": y_n_desc,
            "partial_description": partial_desc,
            "evidence_description": evidence_desc,
            "checked": False,
            "evidence": "",
            "notes": "",
        })

    return items


def evaluate_rubric(items: list, output_content: str, rubric_path: Path) -> dict:
    """
    Evaluate output against rubric.
    In manual mode, this just returns the checklist for user to fill.
    In auto mode, this attempts to score based on content analysis.
    """
    results = {
        "total_items": len(items),
        "checked_items": 0,
        "partial_items": 0,
        "score": 0.0,
        "items": [],
    }

    for item in items:
        result_item = {
            "title": item["title"],
            "description": item["description"],
            "checked": item.get("checked", False),
            "evidence": item.get("evidence", ""),
            "notes": item.get("notes", ""),
        }
        results["items"].append(result_item)

        if item.get("checked", False):
            results["checked_items"] += 1
            results["score"] += 1.0
        elif item.get("partial", False):
            results["partial_items"] += 1
            results["score"] += 0.5

    results["score"] = (results["score"] / results["total_items"]) * 100 if results["total_items"] > 0 else 0.0
    return results


def print_checklist(items: list, output_preview: str = ""):
    """Print rubric checklist for manual evaluation."""
    print("\n" + "=" * 70)
    print("RUBRIC CHECKLIST - Please evaluate each item:")
    print("=" * 70)

    if output_preview:
        print(f"\n[OUTPUT PREVIEW - first 500 chars]:\n{output_preview[:500]}\n")

    for i, item in enumerate(items, 1):
        print(f"\n{i}. {item['title']}")
        print(f"   {item['description']}")
        print(f"   [ ] Y  [P] Partial  [N] No  [ ] Evidence: ________")
        print(f"   Notes: ___________________________________________")

    print("\n" + "=" * 70)
    print("Fill in each item manually using the checklist above.")
    print("=" * 70)


def check_claude_cli() -> bool:
    """Check if claude CLI is available."""
    try:
        result = subprocess.run(
            ["claude", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def generate_with_claude_cli(skill_name: str, prompt: str) -> Optional[str]:
    """Generate output using claude CLI with the plugin loaded."""
    if not check_claude_cli():
        print("[SKIP] claude CLI not found")
        return None

    plugin_dir = str(PLUGIN_DIR)
    prompt_file = OUTPUTS_DIR / f"prompt_{skill_name}.txt"
    prompt_file.write_text(prompt, encoding="utf-8")

    print(f"[INFO] Prompt saved to: {prompt_file}")
    print("[INFO] To generate output, run:")
    print(f"       claude --plugin-dir {plugin_dir} --print < {prompt_file}")
    print("[INFO] Or use interactive mode and paste the prompt.")
    print(f"[INFO] After generating, save output to: {OUTPUTS_DIR / SKILLS[skill_name]['output_file']}")
    return None


def run_manual_mode(skill_name: str, prev_outputs: dict):
    """Run manual test mode: construct prompt, save it, let user generate."""
    skill = SKILLS[skill_name]

    print(f"\n{'='*70}")
    print(f"SKILL: {skill_name}")
    print(f"{'='*70}")

    # Check dependencies
    if "depends_on" in skill:
        deps = skill["depends_on"]
        if isinstance(deps, str):
            deps = [deps]
        for dep in deps:
            output = load_output(dep)
            if not output:
                print(f"[ERROR] Dependency not met: {dep} output not found.")
                print(f"       Run {dep} first, or place output in: {OUTPUTS_DIR / SKILLS[dep]['output_file']}")
                return None
            prev_outputs[dep] = output
            print(f"[OK] Using {dep} output (loaded from file)")

    # Construct prompt
    prompt = construct_prompt(skill_name, prev_outputs)
    prompt_path = OUTPUTS_DIR / f"prompt_{skill_name}.txt"
    prompt_path.write_text(prompt, encoding="utf-8")
    print(f"\n[PROMPT] Saved to: {prompt_path}")

    # Check if output already exists
    existing_output = load_output(skill_name)
    if existing_output:
        print(f"\n[OUTPUT] Found existing output: {OUTPUTS_DIR / skill['output_file']}")
        print("[INFO] To regenerate, delete the output file first or use --force")
        # Show preview
        preview = existing_output[:500]
        print(f"\n[OUTPUT PREVIEW]:\n{preview}\n")
    else:
        print(f"\n[ACTION] Generate output by:")
        print(f"  1. Running: claude --plugin-dir {PLUGIN_DIR} --print")
        print(f"     Then paste the prompt above")
        print(f"  2. Or use claude CLI interactively")
        print(f"  3. After generating, save output to: {OUTPUTS_DIR / skill['output_file']}")

    # Load rubric
    rubric_path = RUBRICS_DIR / skill["rubric_file"]
    items = parse_rubric(rubric_path)

    if existing_output:
        print_checklist(items, existing_output)
    else:
        print("\n[INFO] Rubric checklist (fill after generating output):")
        print_checklist(items)

    return prompt_path


def run_auto_mode(skill_name: str, prev_outputs: dict):
    """Attempt automated generation and evaluation."""
    skill = SKILLS[skill_name]

    print(f"\n{'='*70}")
    print(f"SKILL: {skill_name} (AUTO MODE)")
    print(f"{'='*70}")

    # Check dependencies
    if "depends_on" in skill:
        deps = skill["depends_on"]
        if isinstance(deps, str):
            deps = [deps]
        for dep in deps:
            output = load_output(dep)
            if not output:
                print(f"[ERROR] Dependency not met: {dep}")
                return None
            prev_outputs[dep] = output

    # Try claude CLI
    if check_claude_cli():
        print("[INFO] claude CLI found, attempting generation...")
        prompt = construct_prompt(skill_name, prev_outputs)

        # We can't easily pipe to claude CLI in non-interactive mode
        # So we'll prompt user to run it manually
        generate_with_claude_cli(skill_name, prompt)
        print("[INFO] Auto-generation requires interactive CLI. Using manual fallback.")
        return run_manual_mode(skill_name, prev_outputs)
    else:
        print("[ERROR] claude CLI not available. Cannot auto-generate.")
        print("[INFO] Install Claude Code CLI to enable auto mode:")
        print("       https://claude.com/products/claude-code")
        return None


def evaluate_existing(skill_name: str, scores: dict):
    """Evaluate existing output against rubric (manual scoring)."""
    skill = SKILLS[skill_name]
    output = load_output(skill_name)

    if not output:
        print(f"[ERROR] No output found for {skill_name}")
        return None

    rubric_path = RUBRICS_DIR / skill["rubric_file"]
    items = parse_rubric(rubric_path)

    print(f"\n{'='*70}")
    print(f"EVALUATING: {skill_name}")
    print(f"{'='*70}")
    print(f"\n[OUTPUT] ({len(output)} chars)")
    print(output[:1000] + ("..." if len(output) > 1000 else ""))
    print("\n")

    # In real usage, this would prompt for each item
    # For now, we'll create a scoring template
    print("RUBRIC EVALUATION:")
    print("-" * 70)

    total = len(items)
    checked = 0
    partial = 0

    for i, item in enumerate(items, 1):
        print(f"\n{i}. {item['title']}")
        print(f"   {item['description']}")
        print("   [ ] Not checked  [Y] Yes  [P] Partial  [N] No")
        # In automated evaluation, we'd need LLM to score
        # For manual, user fills this in

    print(f"\n[SUMMARY] Total items: {total}")
    print("[ACTION] Fill in scores manually or use LLM-based evaluator")

    return {
        "skill": skill_name,
        "output_length": len(output),
        "rubric_items": total,
        "status": "pending_manual_evaluation"
    }


def print_report(results: list):
    """Print test report summary."""
    print("\n" + "=" * 70)
    print("TEST REPORT SUMMARY")
    print("=" * 70)

    if not results:
        print("[INFO] No results to report")
        return

    print(f"\n{'Skill':<35} {'Output':<10} {'Rubric':<8} {'Score':<8} {'Status'}")
    print("-" * 70)

    for r in results:
        score_str = f"{r.get('score', 'N/A')}%" if isinstance(r.get('score'), (int, float)) else "N/A"
        print(f"{r['skill']:<35} {r.get('output_length', 'N/A'):<10} {r.get('rubric_items', 'N/A'):<8} {score_str:<8} {r.get('status', 'unknown')}")

    print("\n" + "=" * 70)


def main():
    parser = argparse.ArgumentParser(description="BI Plugin Test Harness")
    parser.add_argument("--mode", choices=["manual", "auto"], default="manual",
                        help="Test mode: manual (user generates) or auto (attempt automated)")
    parser.add_argument("--skill", type=str, help="Specific skill to test")
    parser.add_argument("--all", action="store_true", help="Run all skills in sequence")
    parser.add_argument("--report", action="store_true", help="Print test report")
    parser.add_argument("--force", action="store_true", help="Regenerate outputs even if exist")

    args = parser.parse_args()

    # Determine which skills to run
    skills_to_run = []
    if args.skill:
        if args.skill not in SKILLS:
            print(f"[ERROR] Unknown skill: {args.skill}")
            print(f"Available skills: {list(SKILLS.keys())}")
            return 1
        skills_to_run = [args.skill]
    elif args.all:
        skills_to_run = list(SKILLS.keys())
    else:
        # Default: run business-strategist only
        skills_to_run = ["business-strategist"]

    results = []
    prev_outputs = {}

    for skill_name in skills_to_run:
        if args.mode == "manual":
            result = run_manual_mode(skill_name, prev_outputs)
        else:
            result = run_auto_mode(skill_name, prev_outputs)

        if result:
            results.append({
                "skill": skill_name,
                "status": "prompt_ready",
                "output_file": str(OUTPUTS_DIR / SKILLS[skill_name]["output_file"]),
            })

    if args.report:
        print_report(results)

    return 0


if __name__ == "__main__":
    sys.exit(main())
