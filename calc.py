"""NEURO//PATH: расчёт индекса риска профессии (та же формула, что на сайте).

Запуск:  python calc.py tech senior advanced
Тесты:   python calc.py --test
"""
import sys

INDUSTRY = {"manufacturing": 80, "retail": 75, "finance": 65, "legal": 60,
            "healthcare": 55, "creative": 50, "tech": 45, "education": 40}
AI_USAGE = {"none": 0, "basic": -10, "advanced": -20, "expert": -30}
EXPERIENCE = {"junior": 5, "middle": 0, "senior": -10, "expert": -15}


def risk(industry: str, experience: str, ai_usage: str) -> tuple[int, str]:
    score = INDUSTRY[industry] + AI_USAGE[ai_usage] + EXPERIENCE[experience]
    score = max(10, min(95, score))
    level = "high" if score >= 70 else "medium" if score >= 40 else "low"
    return score, level


def _test() -> None:
    assert risk("tech", "middle", "basic") == (35, "low")
    assert risk("retail", "junior", "none") == (80, "high")
    assert risk("education", "expert", "expert") == (10, "low")      # нижняя граница
    assert risk("manufacturing", "junior", "none") == (85, "high")
    assert risk("finance", "middle", "none") == (65, "medium")
    print("Все тесты пройдены")


if __name__ == "__main__":
    if sys.argv[1:] == ["--test"]:
        _test()
    elif len(sys.argv) == 4:
        s, l = risk(*sys.argv[1:])
        print(f"Индекс риска: {s}% ({l})")
    else:
        print(__doc__)
