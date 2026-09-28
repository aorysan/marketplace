import os
import subprocess
import sys

# Regresi: jalur skrip harus benar-benar ada di repo ini.
# Sebelumnya test ini menunjuk `.agents/skills/sitegen/intake/scripts/extract.py`
# yang tidak pernah ada, sehingga test "lulus" hanya karena path-nya mati.
SCRIPT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts", "extract.py"))


def test_script_path_resolves():
    assert os.path.exists(SCRIPT), f"extract.py tidak ditemukan di {SCRIPT}"


def test_extract_handles_missing_file(tmp_path):
    result = subprocess.run(
        [sys.executable, SCRIPT, str(tmp_path / "tidak-ada.pdf"), str(tmp_path / "out")],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0, "file PDF yang tidak ada harus menghasilkan exit code non-zero"
    assert "not found" in (result.stdout + result.stderr).lower()
