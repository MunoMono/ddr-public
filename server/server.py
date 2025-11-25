"""
DDR Archive GraphQL Server
FastAPI + Strawberry GraphQL
Production: https://ddrarchive.org/graphql
Development: http://localhost:8000/graphql
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from schema import schema

# Environment detection
ENV = os.getenv("DDR_ENV", "development")
IS_PRODUCTION = ENV == "production"

# Create FastAPI app
app = FastAPI(
    title="DDR Archive GraphQL API",
    description="GraphQL API for DDR design archive",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",  # Vite alternate port
    "https://ddrarchive.org",  # Production frontend
]

if not IS_PRODUCTION:
    # Allow all origins in development
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if IS_PRODUCTION else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create GraphQL router
graphql_app = GraphQLRouter(
    schema,
    graphiql=not IS_PRODUCTION,  # Enable GraphiQL only in dev
)

# Mount GraphQL endpoint
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "DDR Archive GraphQL API",
        "environment": ENV,
        "graphql_endpoint": "/graphql",
    }


@app.get("/health")
async def health():
    """Health check for monitoring"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    # Development server configuration
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info",
    )
