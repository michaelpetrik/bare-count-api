# Bare Count API

Minimalist but scalable self-hosted visit counter API written in TypeScript

## Development

### Prerequisites
- Node.js (v20 or newer)
- npm (v10 or newer)

### Setup
```bash
npm install
npm run build
npm run dev
```

### Testing

The project follows TypeScript testing best practices with Jest:

#### Test Structure
```
__tests__/
├── services/
│   ├── counterService.test.ts
│   └── implementations/
│       ├── defaultTimeProvider.test.ts
│       └── mockTimeProvider.test.ts
└── controllers/
    └── counterController.test.ts
```

#### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

#### Architecture Features
- **Dependency Injection**: Time provider abstraction for better testability
- **SOLID Principles**: Clean separation of concerns
- **100% Test Coverage**: For business logic components

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report 