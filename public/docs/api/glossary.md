# Glossary

This glossary provides definitions for key terms used in the DDR Archive API documentation and the broader context of GLAM institutions, design research, computer science and API development.

## GLAM (galleries, libraries, archives, museums)

**GLAM**  
An acronym for galleries, libraries, archives and museums. These cultural-heritage institutions collect, preserve and provide access to cultural and historical materials.

**Linked data**  
A method of publishing structured data using standard web technologies (RDF, URIs) so it can be interlinked and become more useful through semantic queries.

**Linked Art**  
A community and data model for describing cultural heritage using linked-open data, based on CIDOC-CRM.

**CIDOC-CRM**  
The Conceptual Reference Model developed by the International Committee for Documentation (CIDOC). A formal ontology for cultural heritage information.

**Provenance**  
The chronology of ownership, custody, or location of a historical object or document.

**Metadata**  
Data that provides information about other data, such as descriptive, structural, or administrative information about resources.

**Archival fonds**  
The entire body of records of an organization, family, or individual that have been created organically in the course of their activities.

**Finding aid**  
A tool that facilitates discovery and retrieval of archival materials, typically describing the scope and content of a collection.

**Dublin Core**  
A set of 15 core metadata elements for describing digital and physical resources.

## DDR (design-research documentation)

**DDR Archive**  
The Design Research Documentation archive at the Royal College of Art, preserving the history of design research practice.

**RCA**  
Royal College of Art, a postgraduate art and design university in London.

**Design research**  
A systematic investigation that aims to generate new knowledge about design processes, methods, and outcomes.

**Special collections**  
Rare, unique or valuable materials held separately from general collections, requiring special handling.

**Presigned URL**  
A time-limited URL that grants temporary access to private resources stored in cloud storage (S3).

**Agent**  
A person or organization responsible for creating, contributing to, or being associated with archival materials.

**Authority file**  
A controlled list of terms used to ensure consistency in cataloging and indexing.

**Extent**  
The physical or logical size of an archival resource, often measured in linear feet, boxes, or digital file sizes.

## Computer science and web technologies

**API (application programming interface)**  
A set of protocols and tools that allows different software applications to communicate with each other.

**GraphQL**  
A query language and runtime for APIs that allows clients to request exactly the data they need.

**REST (representational state transfer)**  
An architectural style for designing networked applications using stateless HTTP requests.

**Endpoint**  
A specific URL where an API can be accessed by a client application.

**Query**  
A request for data from a database or API, specifying what information should be retrieved.

**Schema**  
A formal definition of the structure and types of data available through an API or database.

**JSON (JavaScript object notation)**  
A lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse.

**HTTP (hypertext transfer protocol)**  
The foundation of data communication on the world wide web.

**Authentication**  
The process of verifying the identity of a user or system attempting to access an API.

**Rate limiting**  
A technique to control the number of requests a client can make to an API within a given time period.

## API concepts

**GET request**  
An HTTP request method used to retrieve data from a server.

**POST request**  
An HTTP request method used to send data to a server to create or update a resource.

**Response format**  
The structure and encoding of data returned by an API, typically JSON or XML.

**Query parameter**  
A key-value pair appended to a URL to pass additional information to an API endpoint.

**Introspection**  
In GraphQL, the ability to query the schema to discover available types and fields.

**Field**  
In GraphQL, a unit of data that can be requested from an object type.

**Mutation**  
In GraphQL, an operation used to modify server-side data (create, update, delete).

**Resolver**  
A function in GraphQL that populates data for a single field in the schema.

**Bearer token**  
A security token included in API requests to authenticate the client.

**CORS (cross-origin resource sharing)**  
A security feature that allows or restricts web applications from making requests to a different domain.

**Pagination**  
A technique for dividing large datasets into smaller, manageable pages of results.

**Webhook**  
A method for an application to provide real-time information to other applications by sending HTTP callbacks.
