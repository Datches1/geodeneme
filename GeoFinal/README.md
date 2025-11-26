#FAMOUSGUESSR

 https://gmt-458-web-gis.github.io/geogame-Datches1/
 
## 🎮 Game Overview

**FAMOUSGUESSR** is an interactive geography game where players guess the birthplaces of Turkish famous people on an interactive Turkey map. Players select difficulty levels and compete against time to earn points by correctly identifying provinces.


## Requirements & Frontend Layout

### Core Features
- **Interactive Turkey Map**: OpenLayers-based vector map with 81 provinces (GeoJSON data)
- **Difficulty Selection**: Two modes (Normal & Hard) with different time mechanics
- **Real-time Feedback**: Visual province highlighting (gray → orange options → green/red results)
- **Countdown Timer**: Dynamic time display with difficulty-based adjustments
- **Score System**: +10 points per correct answer
- **Celebrity Database**: 50+ Turkish famous people with birthplace data
- **Responsive Design**: Optimized for desktop and mobile devices
- **Local Multiplayer**: 2-player turn-based mode on a single device (Hotseat)

### Frontend Layout

<img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/48a7f1bb-c7a8-48ed-864c-0bbf154ee097" />


*Intro Screen* *Main menu with difficulty selection and game information*

<img width="722" height="796" alt="image2" src="https://github.com/user-attachments/assets/8752c88d-050e-4e5a-849f-22b6f1b636f0" />
<img width="718" height="808" alt="image 3" src="https://github.com/user-attachments/assets/94cdfafb-529e-4ba7-8960-81d020dc5663" />
<img width="725" height="846" alt="image 4" src="https://github.com/user-attachments/assets/0fbc6dfd-2930-4b0b-b160-67a3a9aef8b3" />

*Game rules for, normal, hard and dup mode respectively.*

<img width="1914" height="912" alt="image1" src="https://github.com/user-attachments/assets/1cc84279-c9c2-4ad5-b32e-82d667e24845" />

*Game Screen* *Interactive gameplay with province highlighting and real-time feedback*


#### Desktop Layout
```
┌───────────────────────────────────────────────────────┐
│  [🏠 Home]    [⏱️ 87s]  [🎯 0 point]  [❓ Question 1]│
├────────────────────────────────────────────────────── │
│                                                       │
│            Interactive Turkey Map                     │
│          (OpenLayers Vector Layer)                    │
│      - Gray: Unanswered provinces                     │
│      - Orange: Current question options               │
│      - Green: Correct answer (clicked)                │
│      - Red: Wrong answer (clicked)                    │
│                                                       │
├───────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │ [Photo] Famous People Name                    │ │
│  │         Category (Athlete/Actor/Musician)     │ │
│  │ Select the province on the map!               │ │
│  │ Options: [İzmir] [Karabük] [Mardin] [Muğla]   │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## ❓ Required Questions & Answers

### How will the game progress?
The game features **two difficulty levels** with time-based progression:

#### **Normal Mode (90 seconds)**
- Fixed 90-second timer
- Each correct answer: **+10 points**
- Wrong answers: No time penalty
- Players answer as many questions as possible until time runs out
- Simple mechanics for casual gameplay

#### **Hard Mode (60 seconds)**
- Starts with 60 seconds
- Each correct answer: **+10 points** and **+1 second** bonus time
- Each wrong answer: **-3 seconds** time penalty
- Game ends if time reaches 0 from wrong answers
- Strategic gameplay requiring quick thinking and accuracy

#### **⚔️ Duo (Local Multiplayer)**
Played on a single device where two players take turns guessing.
- **Turn-Based System**: 2 Players take turns answering questions.
- **Time Limit**: Fixed **90 seconds** total game time.
- **Scoring**: 
  - Each correct answer: **+10 points**.
  - **Time Pressure Penalty**: **-1 point per 2 seconds** while waiting/thinking.
- **Winning Condition**: The player with the highest score wins when the global timer runs out.
- **Interaction**: Players click provinces on the map to answer, just like in single-player modes.

### How many questions will there be?
- **Dynamic question count** based on player performance
- Questions continue until timer expires
- Typical session: **10-15 questions** depending on difficulty and speed
- No predetermined question limit
- Questions drawn randomly from celebrity database without repetition

### How many lives does a user have?
- **No life system** (0 lives)
- Game is purely **time-based**
- In Normal mode: Timer runs continuously regardless of wrong answers
- In Hard mode: Wrong answers reduce time, but no instant game over
- In Duo mode: -1 point per 2 seconds while waiting/thinking.
- Focus on maximizing score within time limit

---

## 🛠️ JavaScript Libraries

### Primary Libraries
- **OpenLayers 10.7.0**: 
  - Interactive map rendering
  - Vector layer styling and hover effects
  - GeoJSON data visualization
  - Click/hover event handling
  - Province highlighting system

- **React 19.2.0**:
  - Component-based UI architecture
  - State management (useState, useEffect, useRef)
  - React Router DOM for navigation

- **Vite 7.2.0**:
  - Fast development server
  - Hot module replacement (HMR)
  - Optimized production builds

### Bonus/Advanced Features (Potential)
- **D3.js** or **Chart.js**: Post-game statistics visualization
- **Framer Motion**: Enhanced UI animations
- **Deck.gl**: Advanced 3D map visualizations (future enhancement)

---

## 🎨 Visual Design System

### Color Scheme
- **Primary**: Blue gradient (`#1e3a8a` → `#3b82f6`)
- **Brand Badge**: Red (`#ef4444`)
- **Province Colors**:
  - Default: Gray (`#9E9E9E`)
  - Options: Orange (`#FFA726`)
  - Correct: Green (`#4CAF50`)
  - Wrong: Red (`#F44336`)
  - Hover: Light gray (`#ADADAD`)

### Typography
- **Title Font**: Bold, 60px (desktop)
- **Body Font**: Regular, 18px
- **UI Elements**: Sans-serif (Arial/system fonts)

---

## 📊 Game Mechanics (Detailed Flow)

### Game Initialization
1. User selects difficulty (Normal/Hard) on intro screen
2. Welcome modal displays game rules
3. Timer starts on "Let's Start!" button click
4. First celebrity question loads

### Province Highlighting System
- **Hover Effect**: All provinces show tooltip with name
- **Option Highlighting**: 4 options turn orange when question loads
- **Click Feedback**: Clicked province immediately turns green/red
- **Persistent Green**: Correct provinces remain green throughout game

---

### Province Data
- 81 Turkish provinces with coordinates
- GeoJSON polygon geometries
- Distance calculation utilities
- Province name matching with special cases


## 📝 Notes

- **No multiple choice buttons**: Direct map interaction only
- **No streak system**: Pure time-based scoring
