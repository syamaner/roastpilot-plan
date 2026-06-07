Earlier in October 2025, I built a Coffee Roaster Agent prototype using a microphone to listen to roast session to identify the first crack, an MCP server wrapping FC detection, an MCP server to control a HotTop home coffee roaster and n8n as the orchestration as a proof of concept.

This works and gives me nice roasts still.


I have started rebuilding a proper version past few months with a goal of:

- Improve the AST fine tuning pipeline. Annotation, file chunking, fine-tuning, evaluation and publishing to hugging face. Done.
  - https://github.com/syamaner/coffee-first-crack-detection
  - https://dev.to/syamaner/part-1-the-architecture-the-agent-spec-driven-ml-development-with-warpoz-3al6
  - https://dev.to/syamaner/part-2-the-data-building-the-first-public-coffee-roasting-audio-dataset-with-warpoz-2n2g
  - https://dev.to/syamaner/part-3-the-science-hyperparameter-tuning-getting-to-100-precision-with-warpoz-41cc
  - https://dev.to/syamaner/part-4-edge-deployment-of-an-86m-parameter-audio-transformer-1821
  - https://dev.to/syamaner/part-5-from-local-model-to-live-demo-publishing-to-hugging-face-with-warpoz-511p
- I also learned that 2 MCPs added complexity and that should have been consolidated. And I have done that.
  - https://github.com/syamaner/coffee-roaster-mcp

Then I have the old legacy as a reference:
  - https://github.com/syamaner/bean-agent
  - https://dev.to/syamaner/part-1-training-a-neural-network-to-detect-coffee-first-crack-from-audio-an-agentic-development-1jei
  - https://dev.to/syamaner/part-2-building-mcp-servers-to-control-a-home-coffee-roaster-an-agentic-development-journey-with-58ik
  - https://dev.to/syamaner/part-3-from-neural-networks-to-autonomous-coffee-roasting-orchestrating-mcp-servers-with-net-58pd


The key part of this rebuild is the agent harness we are building.
  - Deterministic control and LLM as an advisory agent. 
  - Feedback learning. Roasted coffee shared with a link to roast. Friends rate it. And the feedback for same origin coffee used in future roasts.
    - This is possible because each roast already captured all the logs / roast events. 

I have submitted a conference talk on this:
- /Users/sertanyamaner/git/mcp-dev-summit-proposal/Proposal/sessionize-submission-v3.md

And here is all the plans I created so far:
  - /Users/sertanyamaner/git/coffee-roaster-agent-v2


At this stage we will need to first review the plans and agree on repository structure.
We will keep new plans in /Users/sertanyamaner/git/coffee-roaster-agent-v2/agreed-plan

First steps:

- We decide on how many new repositories we need and what they look like
- Then we drill into details of each component as individual plans under a sub folder for each repo. We don't create repos yet.
- For each, we will need to prototype the UI where needed. This is going to need some external tools you can recommend to me. 
- For each, recommend me if we need any specialised sub agents in each repo and what they would be good for. 

Let me know if you have any questions. Ensure no assumptions and we need a high accuracy, detailed plan for each component that is grounded in facts.