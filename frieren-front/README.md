# Frieren Web Frontend

![Mascot](../assets/mascot-panel-mini.png)

## Description

Frieren Web is the frontend part of the Frieren project, built with modern web technologies like React and Vite. It provides a responsive and intuitive user interface for interacting with the Frieren backend services. This project aims to deliver a seamless experience for managing and configuring network devices.

## Features

- **Reactive UI**: Utilizes React for a responsive and dynamic user interface.
- **Form Management**: Integrated with `react-hook-form` for efficient form handling.
- **State Management**: Uses `jotai` for simple and intuitive state management across components.
- **Error Handling**: Implements `react-error-boundary` for better error management and user feedback.
- **Custom Icons**: Supports custom icons generation with `fantasticon`.
- **Minimal Build Size**: Dependencies are meticulously chosen and utilized to minimize the footprint of the project's distribution, ensuring fast deployment and optimal performance.
- **UMD Module Support**: The project is designed with flexibility in mind, allowing for the integration of UMD modules to extend its functionality. For more details on how to leverage this feature, see more.

## Installation

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/xchwarze/frieren
cd frieren/frieren-front
yarn install
```

## Usage

To start the development server, run:

```bash
cd frieren/frieren-front
cp config/.env.dev .env
yarn dev
```

For building the project for production, use:

```bash
cd frieren/frieren-front
cp config/.env.prod .env
yarn build
```

Check out the other scripts in `package.json` for linting, previewing the build, and more.

## API Integration

The frontend is designed to work seamlessly with the Frieren backend. Ensure the backend service is running and accessible to allow full functionality.

## Requirements

- Node.js 20 or higher
- Yarn package manager
- A running instance of the Frieren backend

## Contributing

Contributions are welcome! Please refer to the project's contribution guidelines for more details.

## License

This project is licensed under the LGPL-3.0-only License - see the LICENSE file in the root directory for details.

Image Licensing Information: The images used in this project are subject to their own individual licenses and specific terms. For a detailed explanation of these licenses and any applicable notes, please review our [Image Licensing Document](../assets/ASSETS_CREDITS.md).

## Authors and Acknowledgment

- **Lead Developer**: DSR! - xchwarze@gmail.com

Thank you to all the contributors and the community for supporting the Frieren project.

## Contact

For support or queries, contact xchwarze@gmail.com.
