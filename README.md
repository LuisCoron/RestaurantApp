Aura Gourmet — Project Overview
Relevant source files
Aura Gourmet is a high-level restaurant management and customer experience mobile application built with React Native and Expo. It provides a dual-interface system catering to both customers (ordering, reservations, AI-driven recommendations) and administrators (order management, menu CRUD, and business metrics).

Core Value Proposition
The application bridges the gap between traditional dining and digital convenience by implementing a custom state management system that handles complex data flows like real-time cart calculations, table capacity enforcement, and an intelligent recommendation engine.

Tech Stack
The project leverages a modern JavaScript mobile stack centered around the Expo ecosystem.

Category	Technology	Purpose
Framework	react-native (0.81.5)	Core UI framework 
package.json
19
Platform	expo (~54.0.33)	Managed workflow and build tools 
package.json
16
Navigation	@react-navigation (v7)	Tab and Stack navigation 
package.json
13-15
Persistence	@react-native-async-storage	Local data persistence 
package.json
12
State	Custom Singleton Stores	Global state without external libraries
Sources:

package.json
11-22
package-lock.json
7-22
System Architecture
The application follows a modular architecture where UI components interact with a centralized data layer consisting of specialized "Stores".

High-Level Component Relationship
This diagram illustrates how the entry point initializes the system and hands off control to the navigation and state layers.
















Sources:

index.js
1-8
App.js
16-66
src/navigation/AppNavigator.js
1-50
 (referenced in 
App.js
14
)
Key Features
1. Intelligent Ordering & Menu
Customers can browse a categorized menu with real-time availability. The app includes a "Gourmet IA" feature—a multi-step questionnaire that uses a weighted scoring algorithm to recommend dishes based on dietary restrictions and hunger levels.

2. Table Reservations
A robust booking system that enforces MAX_CAPACITY_PER_SLOT (20 guests) and manages time-slot availability through a custom calendar implementation.

3. Administrative Control
Administrators have access to a restricted "Admin" tab. This allows for real-time status updates on kitchen orders (En Cocina → Listo → Entregado) and full CRUD operations on the menu catalog.

4. Custom State Management
Instead of Redux or Context API, the app uses a custom singleton pattern with a subscription model. This ensures high performance and persistence across app reloads using AsyncStorage.

Codebase Organization
The project structure separates configuration from business logic and UI components.

Path	Description
/	Root configuration (app.json, package.json, App.js).
/src/navigation/	Routing definitions and role-based access logic.
/src/store/	The "Brain" of the app: Singleton stores for Auth, Cart, Menu, and Reservations.
/src/screens/	UI components categorized by role (Client vs. Admin).
/src/theme/	Centralized design tokens (Colors, Spacing).
/src/data/	Mock data and initial state schemas.
Navigation Map & Boot Sequence
The application boot sequence handles the transition from a native splash screen to the interactive UI while initializing stores.



Sources:

App.js
17-32
App.js
58-65
Detailed Documentation
For more specific technical details, please refer to the following sections:

Getting Started & Project Setup: Installation, scripts, and Expo configuration.
Application Architecture & Boot Sequence: Detailed breakdown of the initialization lifecycle and global provider tree.
