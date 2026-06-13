# Design Document: Environment Variable API Key Injection

## Overview

This design implements secure API key management by loading the LLM API key from environment variables instead of hardcoding it. The solution supports both development (via `.env` file) and production (via system environment variables) environments.

## Architecture

The implementation follows a layered approach:

1. **Environment Loading Layer**: Reads environment variables at application startup
2. **Configuration Layer**: Provides the LLM_CONFIG object with injected values
3. **Error Handling Layer**: Validates configuration and provides meaningful error messages

### Environment Variable Strategy

- **Development**: Use `.env` file with `VITE_LLM_API_KEY` variable
- **Production**: Inject via system environment variables
- **Build Time**: Webpack DefinePlugin injects environment variables during build

## Components and Interfaces

### 1. Environment Configuration Module (`src/lib/env.js`)

**Purpose**: Centralized environment variable loading and validation

**Interface**:
```javascript
// Load and validate environment variables
function loadEnvConfig() {
  // Returns: { apiKey: string }
  // Throws: Error if VITE_LLM_API_KEY is not set
}

// Get API key with fallback
function getApiKey(fallback = null) {
  // Returns: string | null
}
```

### 2. LLM Configuration Update (`src/legacyApp.js`)

**Changes**:
- Replace hardcoded `apiKey: "***"` with environment variable value
- Add validation to ensure API key is available before making LLM calls
- Update error handling to provide clear feedback when API key is missing

### 3. Webpack Configuration Update (`webpack.config.js`)

**Changes**:
- Add `dotenv` package to load `.env` file during development
- Configure `DefinePlugin` to inject environment variables into the bundle
- Ensure `VITE_LLM_API_KEY` is available at runtime

## Data Models

### Environment Configuration Object

```javascript
{
  apiKey: string,        // LLM API key from VITE_LLM_API_KEY
  isDevelopment: boolean // true if running in development mode
}
```

## Error Handling

1. **Missing API Key**: Display user-friendly error message
   - Message: "API key not configured. Please set VITE_LLM_API_KEY environment variable."
   - Action: Prevent LLM calls from being made

2. **Invalid API Key**: Handled by LLM service (existing error handling)

3. **Configuration Validation**: Validate at application startup
   - Check if `VITE_LLM_API_KEY` is set
   - Provide clear error messages in console and UI

## Testing Strategy

### Unit Tests
- Test environment variable loading with and without `.env` file
- Test fallback behavior when API key is missing
- Test configuration validation

### Integration Tests
- Test that LLM calls use the injected API key
- Test error handling when API key is missing
- Test that different API keys work in different environments

### Manual Testing
- Verify `.env` file loading in development
- Verify environment variable injection in production build
- Verify error messages when API key is missing

## Implementation Notes

1. **Backward Compatibility**: The change is backward compatible - existing code using `LLM_CONFIG` will continue to work

2. **Security**: API key is never logged or exposed in error messages

3. **Development Experience**: `.env` file makes local development easier without modifying source code

4. **Production Deployment**: Environment variables are injected at deployment time, keeping secrets out of the codebase
