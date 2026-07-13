"""
CodeChef stats fetcher.
Scrapes the public CodeChef profile page.

Returns:
    {
        total_solved: int | null,
        active_days: null,
        heatmap: null,
        contest_rating: int | null,
        max_rating: int | null,
        stars: str | null,
    }
"""

import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


def fetch_codechef(username: str) -> dict:
    """Fetch CodeChef stats for *username*."""
    url = f"https://www.codechef.com/users/{username}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # ── Rating ──
    rating = None
    rating_el = soup.find("div", class_="rating-number")
    if rating_el:
        try:
            rating = int(rating_el.get_text(strip=True))
        except ValueError:
            pass

    # ── Max Rating ──
    max_rating = None
    max_el = soup.find("small", string=re.compile(r"Highest Rating", re.I))
    if max_el:
        nums = re.findall(r"\d+", max_el.get_text())
        if nums:
            max_rating = int(nums[0])

    # ── Stars ──
    stars = None
    star_el = soup.find("span", class_="rating")
    if star_el:
        stars = star_el.get_text(strip=True)

    # ── Problems solved ──
    total_solved = None
    # CodeChef shows "Fully Solved" and "Partially Solved" sections
    solved_section = soup.find("h5", string=re.compile(r"Fully Solved", re.I))
    if solved_section:
        # Count the links in the following section (each link = one problem)
        parent = solved_section.find_parent("section") or solved_section.find_parent("div")
        if parent:
            problems = parent.find_all("a", href=re.compile(r"/problems/"))
            total_solved = len(problems)

    # Alternative: look for "Total Problems Solved" text
    if total_solved is None:
        for el in soup.find_all("h5"):
            text = el.get_text(strip=True)
            if "Problems Solved" in text:
                nums = re.findall(r"\d+", text)
                if nums:
                    total_solved = int(nums[0])
                    break

    return {
        "total_solved": total_solved,
        "active_days": None,
        "heatmap": None,
        "contest_rating": rating,
        "max_rating": max_rating,
        "stars": stars,
    }
