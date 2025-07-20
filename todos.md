Remaining to-dos

- Style + pagination + flows refresh w Tailwind as prescribed in the reference zips
- ✅ Mock data for all tables! ~50 lawyers and user profiles? Actually create a migration file for reproduction!
  - Created simple seed script: `npx ts-node scripts/seed-simple.ts`
  - Created 5 lawyers (lawyer1-5@example.com) and 3 seekers (seeker1-3@example.com)
  - Password for all accounts: Test123!@#
  - Data is now visible in the app via API: http://localhost:4000/api/lawyers/search
- AI search agent for lawyer matching - as specified in the langgraph implementation detailing in the PRD.md
- Chat interface for active conversations for both types of users - maybe with @chatscope/chat-ui-kit-react
- GitHub issues-styled threads/forum (private) for an active escalated case - with multiple users - maybe @giscus/react
- Cmdk global command palette for quick routing and functions / invoking agent


- Connect NewsCord via their API - https://europe-west2-unbiased-reporting.cloudfunctions.net/get-aj?mode=%22all_pro_p%22
* date: the publication date of the article (e.g. “20 July, 2025”)
* headline: the article’s title
* image: URL of the main accompanying photo
* logo: URL of the source’s favicon or logo
* source: name of the news outlet (e.g. “Al Jazeera”)
* text: full body copy of the article
* url: link to the original online story

- Use this within the existing card component but in a separate tab for news stories

