

# ZachLTech's 404 Page

A unique 404 error page featuring an interactive terminal easter egg inspired by Mr. Robot. This project combines a sleek frontend with a WebSocket-enabled backend for a unique user experience.

## Overview

This project has been a passion project I've wanted to make for ~2 years but never had the time so now, I've finally brought to life. It features:
- Custom 404 page with dark aesthetic
- Interactive terminal easter egg
- WebSocket proxy system for terminal connectivity
- Mr. Robot inspired design and functionality
- Docker support for self-hosting

## Tech Stack

- Frontend: HTML, CSS, JavaScript, TailwindCSS
- Backend: Node.js with WebSocket support
- Container: Docker & Docker Compose
- Server: Nginx

## Easter Egg

There's a hidden terminal feature waiting to be discovered... but you'll have to find it yourself! (Hint: Mr. Robot fans might notice something familiar)

## [Live Site](https://404.zachl.tech)

## Local Development

```bash
# Clone the repository
git clone https://github.com/zachltech/404.git

# Start the containers
docker-compose up -d

# Access the site
open http://localhost:3000
```