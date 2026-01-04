# Overview

### Key features

- **Linked-data compliance**: 100% implementation of Tim Berners-Lee's semantic web principles
- **Persistent identifiers**: Every record receives a stable, permanent URI
- **International standards**: Full integration with Linked Art, IIIF and Getty vocabularies
- **Access control**: Three-tier system (public, restricted, internal) protecting sensitive materials
- **GraphQL API**: Flexible querying for researchers and developers

### Architecture highlights

Our platform implements:

- **FastAPI backend** with PostgreSQL 14 (JSONB for flexible schemas)
- **React + Vite frontend** for staff ingestion interface
- **Docker Compose** orchestration for production deployment
- **DigitalOcean Spaces** for S3-compatible media storage
- **Auth0** for secure single sign-on

### For researchers

The archive provides multiple access methods:

1. **Web interface**: Browse and search collections
2. **REST API**: Programmatic access to metadata
3. **GraphQL endpoint**: Flexible queries across relationships
4. **IIIF viewers**: Deep zoom into high-resolution images
5. **Linked-data URIs**: Machine-readable semantic metadata

### For developers

Our open infrastructure enables:

- Harvesting metadata via content negotiation
- Integrating IIIF manifests into external viewers
- Querying via GraphQL for custom applications
- Linking to our persistent URIs in your research outputs

---

For detailed technical documentation, see the Linked data best practice section below.
