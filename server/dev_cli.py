"""Throwaway CLI for exercising the agent without any HTTP layer.

    python dev_cli.py "what does the star ring show?"
"""

import sys

from ask_agent import run_agent


def main():
    query = " ".join(sys.argv[1:])
    if not query:
        print("Usage: python dev_cli.py <question>")
        return

    result = run_agent(query, history=[])

    print(f"\nQ: {query}")
    print(f"A: {result['answer']}\n")
    print(f"Retrieved {len(result['passages'])} passage(s):")
    for p in result["passages"]:
        print(f"  - [{p['source']}] (distance={p['_distance']:.3f}) {p['text'][:100]}...")


if __name__ == "__main__":
    main()
