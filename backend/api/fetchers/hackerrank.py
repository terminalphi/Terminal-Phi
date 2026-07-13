"""
HackerRank stats fetcher.
Uses HackerRank's semi-public REST endpoints.

Returns:
    {
        total_solved: int | null,
        active_days: null,
        heatmap: null,
        contest_rating: null,
        badges: int | null,
    }
"""

import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


def _try_scores(username: str) -> dict | None:
    """Attempt to get submission scores via the scores_elo endpoint."""
    try:
        url = f"https://www.hackerrank.com/rest/hackers/{username}/scores_elo"
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            return None

        data = resp.json()
        # data is typically a list of { name, practice: { score }, ... }
        total = 0
        if isinstance(data, list):
            for track in data:
                practice = track.get("practice", {})
                solved = practice.get("solved", 0)
                if isinstance(solved, (int, float)):
                    total += int(solved)

        return {"total_solved": total if total > 0 else None}
    except Exception:
        return None


def _try_badges(username: str) -> int | None:
    """Attempt to get badge count."""
    try:
        url = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if isinstance(data, dict) and "badges" in data:
            return len(data["badges"])
        if isinstance(data, list):
            return len(data)
        return None
    except Exception:
        return None


def fetch_hackerrank(username: str) -> dict:
    """Fetch HackerRank stats for *username*."""
    scores = _try_scores(username)
    badge_count = _try_badges(username)

    total_solved = scores.get("total_solved") if scores else None

    if total_solved is None and badge_count is None:
        raise ValueError(
            f"Could not fetch HackerRank data for '{username}'. "
            "The profile may be private or the username incorrect."
        )

    return {
        "total_solved": total_solved,
        "active_days": None,
        "heatmap": None,
        "contest_rating": None,
        "badges": badge_count,
    }
