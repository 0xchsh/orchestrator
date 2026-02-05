.PHONY: dev build test lint deploy clean

dev:
	@tsx --watch src/index.ts

build:
	@tsc

test:
	@jest

lint:
	@eslint src --ext .ts

format:
	@prettier --write src

deploy:
	@ssh charles@vps "cd ~/orchestrator && git pull && npm ci && pm2 restart orchestrator"

clean:
	@rm -rf dist node_modules

install:
	@npm install --silent