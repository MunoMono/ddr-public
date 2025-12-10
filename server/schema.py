"""
DDR Archive GraphQL Schema
Built with Strawberry GraphQL for ddrarchive.org
"""
import strawberry
from typing import Optional, List
from datetime import datetime


@strawberry.type
class Multimedia:
    """Image or media assets associated with archive objects"""
    url: str
    thumbnail: Optional[str] = None
    large: Optional[str] = None
    caption: Optional[str] = None


@strawberry.type
class ArchiveObject:
    """Core archive object representing a design artifact"""
    id: str
    title: str
    description: Optional[str] = None
    date: Optional[str] = None
    maker: Optional[str] = None
    general: Optional[str] = None  # Type: poster, textile, etc.
    department: Optional[str] = None
    nationality: Optional[str] = None
    multimedia: Optional[List[Multimedia]] = None
    has_images: bool = False
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@strawberry.type
class Person:
    """Designer, maker, or contributor in the archive"""
    id: str
    display_name: str
    nationality: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    biography: Optional[str] = None


@strawberry.type
class Department:
    """Organizational department or collection"""
    id: str
    name: str
    description: Optional[str] = None


@strawberry.type
class SearchResult:
    """Paginated search results"""
    total: int
    page: int
    per_page: int
    objects: List[ArchiveObject]


@strawberry.type
class Query:
    """GraphQL query root for DDR Archive"""
    
    @strawberry.field
    def object(
        self,
        maker: Optional[str] = None,
        general: Optional[str] = None,
        has_images: Optional[bool] = None,
        size: int = 10,
        page: int = 1,
    ) -> List[ArchiveObject]:
        """
        Query archive objects with filters
        
        Args:
            maker: Filter by designer/maker name
            general: Filter by object type (poster, textile, etc.)
            has_images: Only return objects with images
            size: Number of results to return (max 100)
            page: Page number for pagination
        """
        # Mock data for now - replace with actual database queries
        mock_objects = [
            ArchiveObject(
                id="ddr-001",
                title="Expo '70 Poster",
                description="Iconic poster design for Osaka World Exposition",
                date="1970",
                maker=maker or "Ikko Tanaka",
                general=general or "poster",
                department="Graphic Design",
                nationality="Japan",
                has_images=True,
                summary="Bold geometric composition in red and white",
            ),
            ArchiveObject(
                id="ddr-002",
                title="Tadanori Yokoo Exhibition Poster",
                description="Psychedelic poster design",
                date="1968",
                maker=maker or "Tadanori Yokoo",
                general=general or "poster",
                department="Graphic Design",
                nationality="Japan",
                has_images=True,
                summary="Colorful psychedelic imagery",
            ),
        ]
        
        # Apply filters
        filtered = mock_objects
        if has_images is not None:
            filtered = [obj for obj in filtered if obj.has_images == has_images]
        
        # Pagination
        start = (page - 1) * size
        end = start + size
        return filtered[start:end]
    
    @strawberry.field
    def search(
        self,
        query: str,
        page: int = 1,
        per_page: int = 10,
    ) -> SearchResult:
        """
        Full-text search across archive objects
        
        Args:
            query: Search term
            page: Page number
            per_page: Results per page (max 100)
        """
        # Mock search results - replace with actual search implementation
        all_objects = [
            ArchiveObject(
                id="ddr-search-1",
                title=f"Search result for '{query}'",
                description="Mock search result",
                date="2024",
                maker="Designer Name",
                general="poster",
                has_images=True,
            )
        ]
        
        return SearchResult(
            total=len(all_objects),
            page=page,
            per_page=per_page,
            objects=all_objects[:per_page],
        )
    
    @strawberry.field
    def person(self, person_id: str) -> Optional[Person]:
        """Get a single person by ID"""
        # Mock data - replace with database lookup
        return Person(
            id=person_id,
            display_name="Ikko Tanaka",
            nationality="Japan",
            birth_year=1930,
            death_year=2002,
            biography="Renowned Japanese graphic designer",
        )
    
    @strawberry.field
    def departments(self) -> List[Department]:
        """List all departments"""
        return [
            Department(
                id="dept-1",
                name="Graphic Design",
                description="Posters, prints, and visual communication",
            ),
            Department(
                id="dept-2",
                name="Textiles",
                description="Fabric design and textile arts",
            ),
        ]


schema = strawberry.Schema(query=Query)
