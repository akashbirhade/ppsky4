# 📱 Soulmate Sync - Mobile App

Cross-platform mobile application for iOS & Android built with **React Native + Expo**.

## ✨ Features

### 🔐 Authentication
- Email/password login & registration
- OTP email verification
- Google & Apple social login
- Password recovery
- Biometric login support

### 🏠 Home Dashboard
- Personalized greeting with profile completion progress
- Quick action shortcuts (Likes, Premium, Kundali, Video Call)
- New profiles horizontal carousel
- AI-recommended profiles feed
- Daily tips & engagement cards

### 🔍 Discover / Swipe
- Beautiful full-screen profile cards
- Multiple feeds: New, For You, Near Me, Verified, Premium
- Like, Super Like, and Skip actions
- Filter & advanced search
- Animated card interactions

### ❤️ Matches
- Received Likes (who liked you)
- Mutual Matches
- Favorites / Saved profiles
- Grid view with quick preview

### 💬 Messaging
- Real-time chat with Socket.io
- Message types: text, image, voice note, video, document
- Read receipts & delivery status
- Typing indicators
- Online status
- Message search

### 📞 Audio & Video Calling
- Voice calls
- Video calls
- Call controls (mute, speaker, camera flip)
- Call history & missed calls
- In-call timer

### ⭐ Kundali Matching
- 36-point Ashtakoota Guna Milan
- Rashi & Nakshatra selection
- Visual score breakdown
- Manglik Dosha check
- Compatibility percentage

### 💎 Premium Subscriptions
- Silver, Gold, Platinum plans
- Feature comparison
- In-app purchase integration
- Plan benefits showcase

### 👤 Profile Management
- Photo gallery (up to 10 photos)
- Main photo selection
- Detailed profile fields
- Profile completion tracking
- Verification badges
- Bio & hobbies

### ⚙️ Settings
- Privacy controls
- Notification preferences
- Blocked users management
- Language selection
- Dark mode
- Account deletion

## 🏗️ Architecture

```
mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI kit (Button, Input, Avatar)
│   │   └── ProfileCard.tsx   # Profile card component
│   ├── constants/            # Theme, colors, app constants
│   ├── hooks/                # Custom React hooks
│   ├── navigation/           # Navigation stack & tabs
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/              # All app screens
│   │   ├── auth/            # Welcome, Login, Register, OTP, Onboarding
│   │   ├── home/            # Home dashboard
│   │   ├── discover/        # Swipe/discover profiles
│   │   ├── matches/         # Likes, matches, favorites
│   │   ├── messages/        # Conversations list
│   │   ├── chat/            # Individual chat screen
│   │   ├── call/            # Audio/video call screen
│   │   ├── profile/         # My profile, profile detail, edit
│   │   ├── premium/         # Subscription plans
│   │   ├── features/        # Kundali matching
│   │   └── settings/        # App settings
│   ├── services/            # API client & services
│   │   ├── api.ts           # Axios client with JWT refresh
│   │   ├── socket.ts        # Socket.io real-time service
│   │   └── index.ts         # All API service methods
│   ├── store/               # Zustand state management
│   │   ├── authStore.ts     # Auth & user state
│   │   ├── chatStore.ts     # Messages & conversations
│   │   └── matchStore.ts    # Profiles & matching
│   └── utils/               # Utility functions
└── assets/                   # Images, fonts, animations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on physical device (for testing)

### Installation

```bash
cd mobile
npm install
```

### Running

```bash
# Start Expo dev server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#FF6B6B` (Coral Red) |
| Secondary | `#6C63FF` (Purple) |
| Gold/Premium | `#FFB347` |
| Success/Match | `#4ECDC4` |
| Love | `#FF4B8C` |
| Border Radius | 4/8/12/16/20/24px |
| Typography | iOS-native font sizes |

## 📡 Backend Integration

The app connects to the Soulmate Sync backend API:
- **REST API** for CRUD operations
- **Socket.io** for real-time messaging & notifications
- **JWT** with refresh token rotation
- **Secure Store** for token storage

## 🔒 Security

- Tokens stored in Expo SecureStore (encrypted)
- JWT auto-refresh with interceptors
- Input validation on all forms
- No credentials in code/logs
- Certificate pinning (production)
