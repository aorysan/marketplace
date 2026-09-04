import os
import subprocess
import pytest

def test_extract_handles_missing_file():
    result = subprocess.run(
        ["python", ".agents/skills/sitegen/intake/scripts/extract.py", "non_existent_file.pdf"],
        capture_output=True, text=True
    )
    assert "Error" in result.stdout or "Error" in result.stderr or result.returncode != 0
