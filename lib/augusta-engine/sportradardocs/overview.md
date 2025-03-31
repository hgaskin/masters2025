# Sportradar Golf API Overview

## Introduction

Sportradar’s Golf API offers a comprehensive suite of real-time tournament updates, rankings, and seasonal statistics to power your golf experiences.

We provide full hole-by-hole coverage for the:
- PGA Tour
- DP World Tour
- LIV Tour
- LPGA Tour
- Champions Tour
- Korn Ferry Tour
- Olympics
- Ryder Cup
- President's Cup

All Majors are covered. For further coverage info, [click here](https://developer.sportradar.com/golf/reference/golf-overview).

Primary feeds return:
- Schedules
- Tournament leaderboards
- Tee times
- Hole-by-hole scoring

Additional feeds provide:
- Player profiles
- Seasonal statistics
- World golf ranking for the top 200 players
- Detailed course information

Real-time customers are also offered two Push Feeds to enhance speed.

> 🗝️ Authentication is required for all API calls.

---

## API Map

To best utilize the Golf API, you will need several parameters to create your API calls. The map below illustrates how you can obtain the parameters you need.

- **Primary feeds** require only a **date or year** to call the endpoints.
- These feeds provide **Tournament Ids**, which can be used to access **tournament feeds**.

---

## Endpoint Descriptions

- **Daily Change Log** – Provides IDs and timestamps for players, tournaments, schedules, pairings, and statistics modified on a given date.
- **Official World Golf Ranking** – Official rankings and points for the top 200 players.
- **Player Profile** – Biographical info and historical tournament stats for a given player.
- **Player Statistics** – Season stats for all golfers who earned FedEx Cup points in a given year.
- **Players** – Biographical data (height, weight, birthplace, birthdate, residence, college) for players by year and tour.
- **Scorecards per Round** – Round scoring, including player info, course info, and scoring per hole.
- **Seasons** – List of all available seasons per tour.
- **Tee Times per Round** – Tee times for a given round, including pairings and positions.
- **Tournament Hole Statistics** – Field performance per hole in a given tournament.
- **Tournament Leaderboard** – Real-time leaderboard with player stats per round and tournament.
- **Tournament Schedule** – Schedule for a given season, including dates, locations, course layouts, and purses.
- **Tournament Summary** – Info on a tournament by year, including location, course layout, and field.
- **Push Leaderboard** – Real-time tournament statistics with player data at round and tournament levels.
- **Push Scorecard** – Real-time scoring per round, including player and per-hole scoring.

---

## Data Retrieval Sample

To find a pairing’s tee time for a given tournament:

1. Call the **Tournament Schedule** and find the `Tournament Id` for the chosen tournament.
2. Call **Tee Times Per Round** using the `Tournament Id` and a chosen round number.
3. Find your chosen pairing and locate the `tee_time` attribute.

The tee time of the pairing is displayed.

---

## Tour Coverage

### PGA Tour
- All events with FedEx Cup points
- Includes President’s Cup and Ryder Cup

### DP World Tour
- All Race to Dubai point-awarding events
- Includes President’s Cup and Ryder Cup

### LPGA Tour
- All point-awarding stroke/match play events, including Majors
- Includes Solheim Cup

### PGA Tour Champions
- All stroke/match play events with points

### Korn Ferry Tour
- All stroke/match play events with points

### LIV Golf
- All standard stroke play events

### Olympics
- All Men’s and Women’s Golf events

### Hero World Challenge
- Included in PGA Tour Schedule  
- Not reflected in player seasonal stats (no FedEx Cup points)

### The Match Exhibitions
- Included as 'cup'-style events in PGA Tour Schedule  
- Not reflected in seasonal stats (no FedEx Cup points)

### USGA Events
- Covered for the 2019 season

---

## Data Entry Workflow

| Day       | Updates                                                                                      |
|-----------|-----------------------------------------------------------------------------------------------|
| **Sunday**    | Tournament finalized within 2 hours after completion (points and earnings updated)         |
| **Monday**    | - Validate field for next tournament (11pm ET)  <br> - Season stats validation (All Day)   |
| **Tuesday**   | - Player stats updated with weekend results (AM) <br> - Season stats validation (All Day)  <br> - First/Second round tee times entered (10pm CT) |
| **Wednesday** | - Validate field for next tournament (11pm ET)                                             |
| **Thursday**  | - Season stats validation (6pm ET) <br> - Finalize completed round within 1 hour           |
| **Friday**    | - Finalize completed round within 1 hour <br> - Set cut line (11pm ET) <br> - Enter 3rd/4th round tee times (11pm ET) <br> - Create field for next tournament(s) |
| **Saturday**  | - Finalize completed round within 1 hour <br> - If needed, set cut line and enter 4th round tee times (11pm ET) |

---