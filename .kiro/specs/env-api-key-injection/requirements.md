# Requirements Document

## Introduction

This feature enables secure API key management by injecting the LLM API key through environment variables instead of hardcoding it in the source code. This improves security by preventing accidental exposure of sensitive credentials in version control and allows different API keys for different deployment environments.

## Glossary

- **API Key**: Authentication credential used to access the LLM service (currently "***" placeholder)
- **Environment Variable**: Configuration value injected at runtime from the system environment
- **LLM Config**: Configuration object containing baseURL, apiKey, model, and other LLM settings
- **Legacy App**: The existing JavaScript application in src/legacyApp.js

## Requirements

### Requirement 1

**User Story:** As a developer, I want the API key to be loaded from environment variables, so that sensitive credentials are not exposed in source code.

#### Acceptance Criteria

1. WHEN the application starts, THE Legacy App SHALL read the API key from the environment variable `VITE_LLM_API_KEY`
2. IF the environment variable is not set, THEN THE Legacy App SHALL display an error message indicating the missing configuration
3. THE LLM_CONFIG object SHALL use the environment variable value instead of the hardcoded "***" placeholder
4. WHERE the application is deployed to different environments, THE same codebase SHALL work with different API keys injected via environment variables

### Requirement 2

**User Story:** As a DevOps engineer, I want a clear configuration pattern for environment variables, so that deployment is straightforward and consistent.

#### Acceptance Criteria

1. THE application SHALL support loading the API key from a `.env` file during development
2. THE application SHALL support loading the API key from system environment variables during production
3. THE configuration loading mechanism SHALL be documented with examples for both development and production setups
