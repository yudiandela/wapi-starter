# WAPI Starter

## Introduction

Welcome to **WAPI Starter**, a WhatsApp API template designed to simplify the integration of WhatsApp messaging using the [`whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) package. This repository provides a structured and scalable implementation using **NestJS** as the base API framework, making it easier for developers to get started quickly.

## Features

- **WhatsApp Integration**: Utilizes `whiskeysockets/baileys` to manage WhatsApp sessions efficiently.
- **NestJS Framework**: Built on top of NestJS for a modular and maintainable API.
- **Session Management**: Easily manage WhatsApp sessions for multiple users or numbers.
- **QR Code Authentication**: Scan QR codes to establish secure connections with WhatsApp.
- **Messaging & Events**: Send and receive messages, listen to events, and handle webhooks.
- **RESTful API**: Exposes endpoints for easy interaction with the WhatsApp API.
- **Mapped Message**:

  | Type                             | Status |
  | -------------------------------- | ------ |
  | Text                             | ✅     |
  | Image                            | ✅     |
  | Sticker                          | ✅     |
  | Video                            | ✅     |
  | Audio                            | ✅     |
  | Document                         | ✅     |
  | Location                         | ✅     |
  | Contact                          | ✅     |
  | Live Location                    | ❌     |
  | Polling                          | ❌     |
  | Event                            | ❌     |
  | Product                          | ❌     |
  | And Others Not Yet Discovered... | ⭕     |

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/azickri/wapi-starter.git
   cd wapi-starter
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```
3. Configure environment variables:

   - Create a `.env` file in the root directory and configure the required settings (refer to `.env.example`).

4. Start the development server:
   ```sh
   npm run start:dev
   ```
   or
   ```sh
   yarn start:dev
   ```

## Usage

### Starting a WhatsApp Session

1. Run the API server.
2. Call the API endpoint to generate a QR code.
3. Scan the QR code with your WhatsApp application.
4. Once authenticated, the session is active and ready for messaging.

### API Endpoints

- `GET /qr` - Get QR code for authentication
- `GET /contact` - Fetch contact list
- `GET /group` - Fetch group list
- `POST /connect` - Connect a WhatsApp session
- `POST /disconnect` - Disconnect and clear session
- `POST /message` - Send a message
- `POST /status` - Update status message

### API Documentation

Visit [`/documentation`](http://localhost:3000/documentation) to view the full API list via Swagger UI.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve this project.

## Support the Project

If you find this project useful and would like to support further development, you can consider making a small contribution via **Saweria**: [Saweria](https://saweria.co/azickri). Every bit of support is greatly appreciated!

## License

This project is licensed under the **MIT License**.

## Author

Created by **Azickri**. If you find this project helpful, consider giving it a ⭐ on GitHub!
