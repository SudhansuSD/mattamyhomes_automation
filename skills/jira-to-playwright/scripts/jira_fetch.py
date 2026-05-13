#!/usr/bin/env python
"""Fetch Jira issue details or JQL search results.

Usage:
  python jira_fetch.py --issue ABC-123 --format md --out requirements.md
  python jira_fetch.py --jql "project = ABC" --format json --out requirements.json
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List


FIELDS = [
    "summary",
    "description",
    "issuetype",
    "project",
    "components",
    "priority",
    "labels",
    "assignee",
    "reporter",
    "status",
]


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"Missing required env var: {name}", file=sys.stderr)
        sys.exit(2)
    return value


def jira_request(path: str, params: Dict[str, str] | None = None) -> Any:
    base_url = require_env("JIRA_BASE_URL").rstrip("/")
    email = require_env("JIRA_EMAIL")
    token = require_env("JIRA_API_TOKEN")

    url = f"{base_url}{path}"
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"

    auth = base64.b64encode(f"{email}:{token}".encode("utf-8")).decode("ascii")
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Basic {auth}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        data = resp.read().decode("utf-8")
    return json.loads(data)


def jira_search(params: Dict[str, str]) -> Any:
    search_paths = [
        "/rest/api/3/search/jql",
        "/rest/api/3/search",
    ]

    last_error: Exception | None = None

    for path in search_paths:
        try:
            return jira_request(path, params)
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code in {404, 410}:
                continue
            raise

    if last_error is not None:
        raise last_error

    raise RuntimeError("Jira search failed without a response.")


def adf_to_text(node: Any) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "\n".join(filter(None, (adf_to_text(n) for n in node)))
    if isinstance(node, dict):
        node_type = node.get("type")
        if node_type == "text":
            return node.get("text", "")
        if node_type in {"paragraph", "heading", "blockquote"}:
            return adf_to_text(node.get("content", []))
        if node_type in {"bulletList", "orderedList"}:
            items = [adf_to_text(c) for c in node.get("content", [])]
            items = [i for i in items if i]
            return "\n".join(f"- {i}" for i in items)
        if node_type == "listItem":
            return adf_to_text(node.get("content", []))
        if node_type == "hardBreak":
            return "\n"
        return adf_to_text(node.get("content", []))
    return ""


def issue_to_md(issue: Dict[str, Any]) -> str:
    fields = issue.get("fields", {})
    summary = fields.get("summary", "")
    status = (fields.get("status") or {}).get("name", "")
    issuetype = (fields.get("issuetype") or {}).get("name", "")
    description = fields.get("description")
    description_text = adf_to_text(description).strip()

    labels = fields.get("labels") or []
    components = [c.get("name") for c in (fields.get("components") or []) if c.get("name")]

    lines = [
        f"## {issue.get('key', '')} - {summary}",
        f"- Type: {issuetype}",
        f"- Status: {status}",
    ]
    if labels:
        lines.append(f"- Labels: {', '.join(labels)}")
    if components:
        lines.append(f"- Components: {', '.join(components)}")

    lines.append("")
    lines.append("### Description")
    lines.append(description_text if description_text else "(No description provided)")
    lines.append("")
    return "\n".join(lines)


def format_output(issues: List[Dict[str, Any]], fmt: str) -> str:
    if fmt == "json":
        return json.dumps(issues, indent=2)
    sections = [issue_to_md(issue) for issue in issues]
    return "\n".join(sections)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Jira issues or JQL search results.")
    parser.add_argument("--issue", action="append", help="Jira issue key (repeatable)")
    parser.add_argument("--jql", help="JQL query")
    parser.add_argument("--format", choices=["md", "json"], default="md")
    parser.add_argument("--out", help="Output file path")
    args = parser.parse_args()

    if not args.issue and not args.jql:
        print("Provide --issue or --jql", file=sys.stderr)
        sys.exit(2)

    issues: List[Dict[str, Any]] = []

    if args.issue:
        for key in args.issue:
            data = jira_request(
                f"/rest/api/3/issue/{urllib.parse.quote(key)}",
                {"fields": ",".join(FIELDS)},
            )
            issues.append(data)

    if args.jql:
        data = jira_search(
            {
                "jql": args.jql,
                "maxResults": "100",
                "fields": ",".join(FIELDS),
            }
        )
        issues.extend(data.get("issues", []))

    output = format_output(issues, args.format)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(output)
    else:
        print(output)


if __name__ == "__main__":
    main()
