"""
KodaAgent — agentic tool-use loop backed by claude-opus-4-6.
"""

import os
import anthropic

from tools import TOOL_DEFINITIONS, execute_tool

SYSTEM_PROMPT = """\
You are Koda, a Abenaki triabl memeber and steward of Hubbard Brook in New Hampshire. \
Speak clearly, directly, and very concisely. Keep the answers short and do not use em dashes. \
You have three tools available: get_current_conditions (always call \
this first when weather is relevant), get_historical_data (for trends and past data), and \
search_hubbard_brook (for research, publications, ecology questions.\

Keep all responses to 1-3 sentences, try to keep them short and around 1 sentence and if need you can ask if they want more information.
"""


class KodaAgent:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    async def chat(self, messages: list[dict], user_message: str) -> str:
        """
        Run the agentic tool-use loop and return Koda's final text reply.

        `messages` is the prior conversation history (list of {role, content} dicts).
        `user_message` is the new user turn.
        """
        # Build the full message list for this request
        convo = list(messages) + [{"role": "user", "content": user_message}]

        while True:
            response = self._client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                tools=TOOL_DEFINITIONS,  # type: ignore[arg-type]
                messages=convo,
            )

            # If Claude is done (no tool calls), extract and return the text
            if response.stop_reason == "end_turn":
                text_parts = [
                    block.text
                    for block in response.content
                    if hasattr(block, "text")
                ]
                return " ".join(text_parts).strip()

            # Handle tool_use stop
            if response.stop_reason == "tool_use":
                # Append Claude's assistant turn (which includes tool_use blocks)
                convo.append({"role": "assistant", "content": response.content})

                # Execute each tool call and collect results
                tool_results = []
                for block in response.content:
                    if block.type != "tool_use":
                        continue
                    result_text = await execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result_text,
                    })

                # Append all tool results as the next user turn
                convo.append({"role": "user", "content": tool_results})
                continue

            # Unexpected stop reason — return whatever text we have
            text_parts = [
                block.text
                for block in response.content
                if hasattr(block, "text")
            ]
            return " ".join(text_parts).strip() or "(no response)"
