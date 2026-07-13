"""
Codeforces stats fetcher.
Uses the official Codeforces public REST API.

Returns:
    {
        total_solved: int,
        active_days: int,
        heatmap: { "YYYY-MM-DD": count, ... },
        contest_rating: int | null,
        max_rating: int | null,
        rank: str | null,
        contest_history: [ { name, rank, old_rating, new_rating, date }, ... ],
    }
"""

from datetime import datetime, timezone
from collections import defaultdict

import requests

BASE = "https://codeforces.com/api"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


def _api(method: str, **params) -> dict:
    """Call a Codeforces API method and return the 'result' payload."""
    resp = requests.get(
        f"{BASE}/{method}",
        params=params,
        headers=HEADERS,
        timeout=15,
    )
    resp.raise_for_status()
    body = resp.json()
    if body.get("status") != "OK":
        raise ValueError(body.get("comment", "Codeforces API error"))
    return body["result"]


def fetch_codeforces(username: str) -> dict:
    """Fetch Codeforces stats for *username*."""

    # ── User info (rating, rank) ──
    info_list = _api("user.info", handles=username)
    info = info_list[0] if info_list else {}
    contest_rating = info.get("rating")
    max_rating = info.get("maxRating")
    rank = info.get("rank")

    # ── Submissions → unique solved problems + heatmap ──
    submissions = _api("user.status", handle=username)

    solved_set = set()
    day_counts = defaultdict(int)

    for sub in submissions:
        if sub.get("verdict") == "OK":
            # Track unique solved problems by (contestId, index)
            prob = sub.get("problem", {})
            key = (prob.get("contestId"), prob.get("index"))
            solved_set.add(key)

        # Count all submissions per day for the heatmap
        ts = sub.get("creationTimeSeconds")
        if ts:
            try:
                dt = datetime.fromtimestamp(ts, tz=timezone.utc)
                day_counts[dt.strftime("%Y-%m-%d")] += 1
            except (ValueError, OSError):
                pass

    # ── Contest history ──
    try:
        ratings = _api("user.rating", handle=username)
    except Exception:
        ratings = []

    contest_history = []
    for r in ratings[-20:]:  # last 20 contests
        ts = r.get("ratingUpdateTimeSeconds")
        date = ""
        if ts:
            try:
                date = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
            except (ValueError, OSError):
                pass
        contest_history.append({
            "name": r.get("contestName", ""),
            "rank": r.get("rank"),
            "old_rating": r.get("oldRating"),
            "new_rating": r.get("newRating"),
            "date": date,
        })

    return {
        "total_solved": len(solved_set),
        "active_days": len(day_counts),
        "heatmap": dict(day_counts),
        "contest_rating": contest_rating,
        "max_rating": max_rating,
        "rank": rank,
        "contest_history": contest_history,
    }
