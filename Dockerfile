FROM node:22-alpine

# Install PostgreSQL and dependencies
RUN apk add --no-cache postgresql postgresql-contrib postgresql-dev bash

# Create PostgreSQL data directory
RUN mkdir -p /var/lib/postgresql/data /run/postgresql /var/lib/postgresql/log
RUN chown -R postgres:postgres /var/lib/postgresql /run/postgresql

# Initialize PostgreSQL database
USER postgres
RUN initdb -D /var/lib/postgresql/data

USER root

# Copy application code
COPY . /app
WORKDIR /app

# Install root dependencies (if any)
RUN npm install

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Create start script
RUN echo '#!/bin/sh' > /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start PostgreSQL' >> /start.sh && \
    echo 'su postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/logfile -o \"-p 5432\" start"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for PostgreSQL to start' >> /start.sh && \
    echo 'sleep 5' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Set environment variables' >> /start.sh && \
    echo 'export DATABASE_URL="postgresql://postgres@localhost:5432/documents_db"' >> /start.sh && \
    echo 'export PORT=3001' >> /start.sh && \
    echo 'export NEXT_PUBLIC_API_URL="http://localhost:3001/api"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Create database' >> /start.sh && \
    echo 'su postgres -c "createdb documents_db"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Change to app directory' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Run Prisma migrations' >> /start.sh && \
    echo 'cd /app/backend && npx prisma migrate deploy' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Run triggers' >> /start.sh && \
    echo 'cd /app/backend && psql "$DATABASE_URL" -f prisma/migrations/triggers.sql' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Seed database' >> /start.sh && \
    echo 'cd /app/backend && psql "$DATABASE_URL" -f prisma/seed.sql' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start backend' >> /start.sh && \
    echo 'cd /app/backend && PORT=3001 npm run dev &' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start frontend' >> /start.sh && \
    echo 'cd /app/frontend && PORT=3000 npm run dev &' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for processes' >> /start.sh && \
    echo 'wait' >> /start.sh

RUN chmod +x /start.sh

# Expose ports
EXPOSE 3000 3001 5432

# Start the application
CMD ["/start.sh"]