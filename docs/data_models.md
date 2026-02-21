# Модели данных SkySwag

## Общая структура базы данных

```mermaid
erDiagram
    PRODUCT ||--o{ ORDER : has
    USER ||--o{ ORDER : places
    USER ||--o{ ESTIMATE : requests
    USER {
        uuid id PK
        string email
        string password_hash
        enum role
        timestamp created_at
    }
    PRODUCT {
        uuid id PK
        string name
        string model
        string version
        integer price
        integer year
        text description
        boolean in_stock
        timestamp created_at
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        enum status
        integer total_price
        timestamp created_at
    }
    ESTIMATE {
        uuid id PK
        string name
        string phone
        string model
        integer year
        integer hours
        timestamp created_at
    }