# Glim

An AI browser assistant Chrome extension — a sidebar that can see the current tab,
answer questions about what's on screen, and speak responses aloud.

## Features

- Screenshot-aware chat: Glim reads the active tab and answers in context
- Vision + file input (images and documents)
- Text-to-speech replies via ElevenLabs
- Toolbar toggle and injected sidebar UI, Manifest V3

## Tech

Vanilla JavaScript, Chrome Extension Manifest V3 service worker,
Anthropic Messages API (`claude-sonnet-5`), ElevenLabs TTS API.

## Install (development)

1. Clone this repo.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Click the Glim toolbar icon, open Settings in the sidebar, and paste your
   Anthropic API key (and ElevenLabs key if you want voice).

## Configuration

No keys are stored in this repository. Keys are entered in the extension UI and
held in `chrome.storage` on your own machine.

The Claude model is set in one place — `CLAUDE_MODEL` at the top of
`background.js`. Check Anthropic's
[model deprecation page](https://platform.claude.com/docs/en/about-claude/model-deprecations)
before changing it.

## Status

Personal project, in active development.

## License

All rights reserved. © Gokulakrishnan Rajesh
