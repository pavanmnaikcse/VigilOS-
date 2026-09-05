import os
import asyncio
from typing import Dict, Any
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent
from livekit.plugins import google
from app.orchestrator import investigate

load_dotenv()

async def entrypoint(ctx: JobContext):
    print("Connecting to LiveKit...")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    @llm.function_tool(description="Investigates the latest transactions autonomously using the backend Ollama models")
    async def investigate_latest():
        print("Function called: investigate_latest")
        # Tell the UI to navigate
        await ctx.room.local_participant.publish_data(
            b'{"action": "navigate", "path": "/case/latest"}',
            reliable=True,
        )
        # Actually trigger the backend Ollama orchestrator
        # We will mock a transaction for it to investigate
        test_tx = {
            "amount": 2500000.00,
            "currency": "INR",
            "type": "RTGS",
            "sender_account": "ACC_112233",
            "receiver_account": "ACC_998877",
            "timestamp": "2026-09-02T10:00:00Z"
        }
        print("Running autonomous investigation on Ollama...")
        result = await investigate(test_tx)
        
        summary = result.get("ai_summary", "The investigation was completed but no summary was found.")
        return f"I have autonomously investigated the transaction using the backend Ollama models. Here is the summary: {summary}"

    @llm.function_tool(description="Open or view a specific case")
    async def open_case():
        print("Function called: open_case")
        await ctx.room.local_participant.publish_data(
            b'{"action": "navigate", "path": "/case/latest"}',
            reliable=True,
        )
        return "Case opened on the commander's screen."

    @llm.function_tool(description="Open reports module")
    async def open_reports():
        print("Function called: open_reports")
        await ctx.room.local_participant.publish_data(
            b'{"action": "navigate", "path": "/reports"}',
            reliable=True,
        )
        return "Reports module opened."

    print("Starting agent...")
    
    model = google.realtime.RealtimeModel(
        voice="Aoede"
    )

    agent = Agent(
        instructions=(
            "You are Vigil OS Commando, an autonomous AI investigation commander built by Google. "
            "You use the Gemini API for voice interaction, but you delegate heavy analysis to backend Ollama models. "
            "Keep your conversational responses very short and direct. "
            "If asked to investigate or analyze fraud, call the investigate_latest function, which will autonomously use the Ollama models to process the task, and read the summary it gives you."
        ),
        llm=model,
        tools=[investigate_latest, open_case, open_reports],
    )
    
    agent.start(ctx.room)
    print("Agent started successfully!")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
