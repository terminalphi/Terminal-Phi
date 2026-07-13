"""
GeeksForGeeks stats fetcher.
Uses the community-maintained GFG Stats API with a direct-scrape fallback.

Returns:
    {
        total_solved: int,
        easy_solved: int | null,
        medium_solved: int | null,
        hard_solved: int | null,
        active_days: null,      (GFG doesn't expose this reliably)
        heatmap: null,          (GFG doesn't expose a submission calendar)
        contest_rating: null,
        coding_score: int | null,
    }
"""

import requests
from bs4 import BeautifulSoup

# Community API endpoint (returns JSON when raw=y)
COMMUNITY_API = "https://geeks-for-geeks-stats-api.vercel.app/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


def _try_community_api(username: str) -> dict | None:
    """Attempt fetch via the community stats API."""
    try:
        resp = requests.get(
            COMMUNITY_API,
            params={"raw": "y", "userName": username},
            headers=HEADERS,
            timeout=12,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        if not data or "totalProblemsSolved" not in data:
            return None

        return {
            "total_solved": data.get("totalProblemsSolved", 0),
            "easy_solved": data.get("Easy", data.get("easy")),
            "medium_solved": data.get("Medium", data.get("medium")),
            "hard_solved": data.get("Hard", data.get("hard")),
            "coding_score": data.get("codingScore"),
        }
    except Exception:
        return None


def _try_scrape(username: str) -> dict | None:
    """Fallback: scrape the GFG profile page directly."""
    url = f"https://www.geeksforgeeks.org/user/{username}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try to find the score / problems solved from the profile
        score_el = soup.find("span", class_="score_card_value")
        coding_score = None
        if score_el:
            try:
                coding_score = int(score_el.get_text(strip=True))
            except ValueError:
                pass

        # The total solved is often in a specific div
        total_solved = 0
        solved_el = soup.find("div", string=lambda t: t and "Total Problems Solved" in t)
        if solved_el:
            count_el = solved_el.find_next("div")
            if count_el:
                try:
                    total_solved = int(count_el.get_text(strip=True))
                except ValueError:
                    pass

        return {
            "total_solved": total_solved,
            "easy_solved": None,
            "medium_solved": None,
            "hard_solved": None,
            "coding_score": coding_score,
        }
    except Exception:
        return None


def fetch_gfg(username: str) -> dict:
    """Fetch GeeksForGeeks stats for *username*."""
    result = _try_community_api(username)
    if not result:
        result = _try_scrape(username)
    if not result:
        raise ValueError(f"Could not fetch GFG data for '{username}'")

    return {
        **result,
        "active_days": None,
        "heatmap": None,
        "contest_rating": None,
    }
