# Contributing to Microservices Web Interface

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/your-username/microservices-web-interface/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/your-username/microservices-web-interface/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/microservices-web-interface.git
   cd microservices-web-interface
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start example services for testing:
   ```bash
   ./start-services.sh
   ```

## Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns

## Adding New Features

1. **Service Management**: New ways to manage and configure services
2. **Monitoring**: Additional metrics and monitoring capabilities
3. **UI Improvements**: Better user experience and design
4. **Security**: Authentication and authorization features
5. **Integration**: Support for new service types or protocols

## Testing

- Test your changes locally before submitting
- Start example services to test integrations
- Verify UI responsiveness on different screen sizes
- Check browser compatibility

## Documentation

- Update README.md if you change functionality
- Add examples for new features
- Update API documentation for backend changes
- Include screenshots for UI changes

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
