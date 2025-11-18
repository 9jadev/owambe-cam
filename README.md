# Owambe Cam

**Easily Collect Photos From Every Guest At Your Wedding**

Gather every photo & video from your guests into a digital album, ready to share in a live slideshow — no apps, no hassle, so simple even grandma will use it.

---

## About

Owambe Cam is a modern web application built with Angular 19 that makes it effortless to collect and share photos from your special events. Whether it's a wedding, birthday party, conference, or any celebration, your guests can upload photos directly through their browsers without downloading any apps.

### Key Features

- 📸 **Digital Album** - Guests upload photos via a simple QR code or direct link
- 🎥 **Live Photo Wall** - Display uploaded photos in real-time on any screen
- 🎨 **Premium Design** - Beautiful, banking-grade UI with mobile-first responsive design
- ⚡ **No Apps Required** - Works directly in the browser, accessible to everyone
- 🔒 **Photo Moderation** - Review and approve photos before they appear
- 👥 **Multiple Events** - Manage multiple events from a single dashboard
- 📱 **QR Code Sharing** - Easy guest access via scannable QR codes

---

## Tech Stack

This project was built using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.11 with:

- **Angular 19** - Modern standalone components architecture
- **TypeScript 5.7** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with custom theme
- **Angular SSR** - Server-side rendering for optimal performance
- **Reactive Forms** - Robust form handling and validation

---

## Getting Started

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## Project Structure

```
src/
├── app/
│   ├── home.component.*          # Landing page
│   ├── login.component.*         # User authentication
│   ├── signup.component.*        # User registration
│   ├── forgot-password.component.* # Password recovery
│   ├── events.component.*        # My Events dashboard
│   ├── create-event.component.*  # Event creation form
│   ├── dashboard.component.*     # Event home/overview
│   ├── media.component.*         # Photos & Videos management
│   ├── settings.component.*      # Event settings
│   ├── camera.component.*        # Photo capture interface
│   ├── auth.service.ts           # Authentication service
│   └── app.routes.ts             # Application routing
├── styles.css                     # Global styles
└── tailwind.config.js             # Tailwind configuration
```

---

## License

This project is licensed under the MIT License.

---

**Built with ❤️ for capturing life's special moments**
