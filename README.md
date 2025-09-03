# Diet Agent 🍽️

Diet Agent is an AI-powered nutrition assistant that creates personalized meal plans using real-time supermarket data through the Browser-Use Cloud API. The application provides users with accurate pricing, availability, and nutritional information to create practical and budget-friendly meal plans.

![Diet Agent Banner](/public/screenshot.png)

## ✨ Features

- **AI-Powered Meal Planning**: Generate personalized meal plans based on dietary preferences, restrictions, and budget
- **Real-Time Supermarket Data**: Access current prices and product availability from major supermarkets
- **Voice Recognition**: Interact with the assistant using voice commands
- **Interactive Chat Interface**: User-friendly chat interface for seamless interaction
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **Shopping Cart Generation**: Create accurate shopping lists with current pricing
- **Meal Customization**: Adjust meal plans based on preferences and dietary needs

## 🛠️ Technologies Used

- **Frontend**: Next.js, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Context API
- **API Integration**: Browser-Use Cloud API
- **Voice Recognition**: Web Speech API
- **Animations**: Tailwind CSS Animations
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- A Browser-Use Cloud API key (get one at [Browser-Use Cloud](https://cloud.browser-use.com))

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/diet-agent.git
   cd diet-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Create a `.env.local` file in the root directory and add your Browser-Use API key:
   ```
   BROWSER_USE_API_KEY=bu_your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 Usage

### Setting Up Your API Key

1. When you first open the application, you'll be prompted to enter your Browser-Use API key.
2. Enter your API key (starting with `bu_`) and click "Validate & Save API Key".
3. Once validated, you can start using the application.

### Creating a Meal Plan

1. Click on the cloud icon or press Enter/Space to open the chat interface.
2. Type or speak your meal plan request, for example:
   - "Make a meal plan for 3 people for 7 days"
   - "Create a budget-friendly plan under $100"
   - "Plan healthy meals for weight loss"
   - "Make a vegetarian meal plan"
3. The AI agent will process your request and generate a personalized meal plan using real-time supermarket data.
4. Browse through the suggested meal plans and select one to view details.

### Voice Commands

1. Click the microphone icon in the chat interface to activate voice input.
2. Speak your request clearly.
3. The application will process your voice input and respond accordingly.

### Viewing Meal Details

1. After selecting a meal plan, you can view detailed information about each meal.
2. Click on individual meals to see ingredients, preparation instructions, and nutritional information.

### Creating a Shopping Cart

1. From the meal plan view, click "Generate Shopping Cart" to create a shopping list.
2. The application will compile all necessary ingredients with current pricing from your preferred supermarket.
3. You can adjust quantities and remove items as needed.

## 🔌 API Integration

Diet Agent uses the Browser-Use Cloud API to access real-time supermarket data. Here's how it's integrated:

### Browser-Use Service

The application uses a dedicated service to interact with the Browser-Use API:

```typescript
// Example of how the Browser-Use service is used
const service = new BrowserUseService(apiKey);
const task = await service.runMealPlanTask(userQuery, preferences);
const result = await service.waitForTaskCompletion(task.id);
```

### API Key Management

- API keys are securely stored in the browser's localStorage.
- The application validates API keys before use and provides feedback on key status.
- Users can update or change their API key in the settings.

### Error Handling

The application includes robust error handling for API interactions:
- Retry logic with exponential backoff
- User-friendly error messages
- Fallback options when API calls fail

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Browser-Use Cloud](https://cloud.browser-use.com) for providing the API
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful component designs
- [Next.js](https://nextjs.org/) for the React framework

---

Created with ❤️