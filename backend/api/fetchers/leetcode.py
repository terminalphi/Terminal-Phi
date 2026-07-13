"""
LeetCode stats fetcher.
Uses LeetCode's internal GraphQL API (unofficial).

Returns:
    {
        total_solved: int,
        easy_solved: int,
        medium_solved: int,
        hard_solved: int,
        active_days: int,
        heatmap: { "YYYY-MM-DD": count, ... },
        contest_rating: float | null,
        contest_count: int,
        global_ranking: int | null,
    }
"""

import json
from datetime import datetime, timezone

import requests

GRAPHQL_URL = "https://leetcode.com/graphql"

QUERY = """
query getUserData($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    userCalendar {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
  }
}
"""

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


def _parse_heatmap(calendar_json_str):
    """Convert LeetCode's submissionCalendar JSON string → { 'YYYY-MM-DD': count }."""
    if not calendar_json_str:
        return {}
    try:
        raw = json.loads(calendar_json_str)
    except (json.JSONDecodeError, TypeError):
        return {}
    heatmap = {}
    for ts_str, count in raw.items():
        try:
            dt = datetime.fromtimestamp(int(ts_str), tz=timezone.utc)
            heatmap[dt.strftime("%Y-%m-%d")] = count
        except (ValueError, OSError):
            continue
    return heatmap


def fetch_leetcode(username: str) -> dict:
    """Fetch LeetCode stats for *username*."""
    resp = requests.post(
        GRAPHQL_URL,
        json={"query": QUERY, "variables": {"username": username}},
        headers=HEADERS,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json().get("data", {})

    user = data.get("matchedUser")
    if not user:
        raise ValueError(f"LeetCode user '{username}' not found")

    # ── Submission stats ──
    ac_nums = user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
    by_diff = {item["difficulty"]: item["count"] for item in ac_nums}
    total_solved = by_diff.get("All", 0)
    easy = by_diff.get("Easy", 0)
    medium = by_diff.get("Medium", 0)
    hard = by_diff.get("Hard", 0)

    # ── Calendar / heatmap ──
    cal = user.get("userCalendar", {})
    active_days = cal.get("totalActiveDays", 0)
    heatmap = _parse_heatmap(cal.get("submissionCalendar"))

    # ── Contest ranking ──
    contest = data.get("userContestRanking") or {}
    contest_rating = contest.get("rating")
    if contest_rating is not None:
        contest_rating = round(contest_rating, 1)
    contest_count = contest.get("attendedContestsCount", 0)
    global_ranking = contest.get("globalRanking")

    return {
        "total_solved": total_solved,
        "easy_solved": easy,
        "medium_solved": medium,
        "hard_solved": hard,
        "active_days": active_days,
        "heatmap": heatmap,
        "contest_rating": contest_rating,
        "contest_count": contest_count,
        "global_ranking": global_ranking,
    }
