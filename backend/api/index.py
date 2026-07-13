"""
Terminal Phi — Coding Stats API
Flask backend that fetches stats from coding platforms.

POST /api/stats
  Body: { lc_user, gfg_user, cc_user, cf_user, hr_user }
  (null or missing = skip that platform)

Returns a unified JSON response with stats per platform.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

from fetchers.leetcode import fetch_leetcode
from fetchers.codeforces import fetch_codeforces
from fetchers.gfg import fetch_gfg
from fetchers.codechef import fetch_codechef
from fetchers.hackerrank import fetch_hackerrank

app = Flask(__name__)
CORS(app)

# ── Platform registry ────────────────────────────────────────
# Maps the JSON key from the request body to its fetcher function
# and the key used in the response.
PLATFORMS = {
    "lc_user":  ("leetcode",    fetch_leetcode),
    "gfg_user": ("gfg",         fetch_gfg),
    "cc_user":  ("codechef",    fetch_codechef),
    "cf_user":  ("codeforces",  fetch_codeforces),
    "hr_user":  ("hackerrank",  fetch_hackerrank),
}

# ── Future-proof: plug in a cache layer here ─────────────────
# To add caching later, wrap _fetch_one with a TTL cache decorator
# or replace the body with a Redis/memcache lookup + fallback.

def _fetch_one(platform_key, username, fetcher_fn):
    """Fetch stats for a single platform. Returns (key, result_dict)."""
    try:
        data = fetcher_fn(username)
        return (platform_key, data)
    except Exception as exc:
        return (platform_key, {"error": str(exc)})


@app.route("/api/stats", methods=["POST"])
def stats():
    body = request.get_json(silent=True) or {}

    results = {}
    futures = {}

    with ThreadPoolExecutor(max_workers=5) as pool:
        for field, (resp_key, fetcher) in PLATFORMS.items():
            username = body.get(field)
            if not username:
                results[resp_key] = None
                continue
            future = pool.submit(_fetch_one, resp_key, username.strip(), fetcher)
            futures[future] = resp_key

        for future in as_completed(futures):
            key, data = future.result()
            results[key] = data

    return jsonify(results)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "terminal-phi-stats"})


# Local development entry point
if __name__ == "__main__":
    app.run(debug=True, port=5000)
