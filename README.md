# SEP490 Mobile

Customer-facing mobile app for **BShowSell** — an e-commerce and social media management platform. Built with React Native and Expo, allowing customers to browse products, read blog content, place orders, and manage their account.

## Tech Stack

- **Framework**: React Native + Expo (file-based routing via Expo Router)
- **Language**: TypeScript
- **State management**: Redux Toolkit
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Forms**: React Hook Form
- **Animations**: Moti, Lottie
- **Lists**: @legendapp/list (infinite scroll)
- **Media**: Expo Image, Expo Video, Expo Camera
- **Notifications**: Expo Notifications (push)
- **Storage**: Expo Secure Store, AsyncStorage
- **Voice**: Expo Speech Recognition
- **HTTP client**: Axios
- **Tooling**: ESLint, Prettier, Husky, lint-staged

## Project Structure

```
app/
  (auth)/             Login, signup, forgot/reset password
  (tabs)/             Main bottom-tab navigation (home, orders, account)
  (product)/          Product listing & detail
  (cart)/             Shopping cart
  (checkout)/         Checkout flow
  (order)/            Order & pre-order details
  (payment)/          Payment success/failed pages
  (review)/           Product reviews
  (search)/           Search
  (notification)/     Notification list & detail
  (user)/             Profile, update profile, addresses
  (setting)/          Settings
  (change-password)/  Change password
  (general)/          About, privacy policy, terms of service
  blog/               Blog list & detail
components/
  ui/                 Reusable UI components (product card, dropdown, etc.)
  blog/               Blog comments & reactions
  cart/               Cart item components
  order/              Order/pre-order lists, refund & compensate modals
  product/            Product detail components
  layout/             Header and layout components
  guest/              Auth inputs & buttons
  common/             Shared components (infinite scroll, speech recognition modal)
libs/
  stores/             Redux slices & thunks (one folder per domain)
  services/           API service definitions per domain
  hooks/              Custom hooks (useAuthen, useContent, useEngagement, ...)
  types/              Shared TypeScript types
  helper/             Currency & date helpers
  utils/              Token storage, push notification registration, Tiptap renderer
  context/            React contexts (notifications)
constants/            Theme constants
assets/               Images, fonts, animations
```

## Features

| Module             | Description                                                       |
| ------------------ | ------------------------------------------------------------------ |
| **Auth**           | Login, signup, forgot/reset password                              |
| **Home**           | Browse products and content feed                                  |
| **Products**       | Standard, limited, and pre-order product listings & details        |
| **Cart & Checkout**| Add to cart, manage cart items, checkout flow                     |
| **Orders**         | Order & pre-order history, refund and compensation requests       |
| **Payments**       | Payment flow with success/failed result pages                     |
| **Reviews**        | Product reviews                                                    |
| **Blog**           | Blog list, detail, comments, and reactions                        |
| **Search**         | Product/content search                                             |
| **Notifications**  | Push notifications and in-app notification center                  |
| **Profile**        | View/update profile, manage addresses, change password, settings   |
| **General**        | About, privacy policy, terms of service                            |
| **Voice search**   | Speech-to-text input via Expo Speech Recognition                    |

## Prerequisites

- **Node.js** 18 or later
- **Expo CLI** (`npx expo`)
- Expo Go app or a development build for testing on a device/emulator

## Configuration

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=
```

## Installation & Running

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npx expo start
```

From the Expo CLI output, you can open the app in a development build, an Android emulator, an iOS simulator, or Expo Go.

## Scripts

| Command                | Action                                  |
| ----------------------- | --------------------------------------- |
| `npm run start`         | Start the Expo dev server                |
| `npm run android`       | Build and run on Android                 |
| `npm run ios`           | Build and run on iOS                     |
| `npm run web`           | Run in the browser                       |
| `npm run lint`          | Run ESLint                               |
| `npm run format`        | Format the codebase with Prettier        |
| `npm run format:check`  | Check formatting without writing changes |
| `npm run reset-project` | Reset to a blank starter project         |
