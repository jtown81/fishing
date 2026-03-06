# REST API Reference

**Fishing Tournament Manager** provides a REST API for third-party integrations, reporting tools, and mobile apps.

## Authentication

All API requests require an `X-API-Key` header with a valid API key.

```bash
curl -X GET "https://api.fishingtourney.app/api/tournaments/123/standings" \
  -H "X-API-Key: fta_your_api_key_here"
```

### API Key Management

Generate API keys in **Settings → API Keys** (Pro/Org tier only).

**Important:** API keys are shown only once. Store them securely.

### Rate Limiting

Rate limits apply per API key, not per user:

| Tier | Requests/Day | Requests/Hour |
|------|-------------|--------------|
| Free | 100 | 10 |
| Pro | 1,000 | 100 |
| Org | 10,000 | 1,000 |

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests left
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Endpoints

### Base URL
```
https://api.fishingtourney.app/api
```

### Tournaments

#### List Tournaments
```
GET /tournaments
```

**Response:**
```json
[
  {
    "id": "tournament-123",
    "name": "HPA Annual Tournament",
    "year": 2025,
    "location": "Lake Travis",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-06-02T23:59:59Z",
    "rules": {
      "maxFish": 5,
      "releaseBonus": 0.2,
      "teamSize": 2,
      "days": 2
    },
    "publicSlug": "hpa-2025"
  }
]
```

#### Get Tournament Details
```
GET /tournaments/{id}
```

---

### Teams

#### List Teams
```
GET /tournaments/{tournamentId}/teams
```

**Response:**
```json
[
  {
    "id": "team-456",
    "tournamentId": "tournament-123",
    "teamNumber": 1,
    "members": [
      { "firstName": "John", "lastName": "Smith" },
      { "firstName": "Jane", "lastName": "Doe" }
    ],
    "status": "active"
  }
]
```

#### Get Team Details
```
GET /tournaments/{tournamentId}/teams/{teamId}
```

---

### Weigh-Ins

#### List Weigh-Ins
```
GET /tournaments/{tournamentId}/weigh-ins
```

**Query Parameters:**
- `day`: Filter by day (1 or 2)
- `teamId`: Filter by team

**Response:**
```json
[
  {
    "id": "weighin-789",
    "tournamentId": "tournament-123",
    "teamId": "team-456",
    "teamNumber": 1,
    "day": 1,
    "fishCount": 3,
    "rawWeight": 12.5,
    "fishReleased": 1,
    "bigFishWeight": 4.2,
    "receivedBy": "John Smith",
    "issuedBy": "Admin",
    "timestamp": "2025-06-01T14:30:00Z"
  }
]
```

#### Create Weigh-In
```
POST /tournaments/{tournamentId}/weigh-ins
```

**Request Body:**
```json
{
  "teamId": "team-456",
  "day": 1,
  "fishCount": 3,
  "rawWeight": 12.5,
  "fishReleased": 1,
  "bigFishWeight": 4.2,
  "receivedBy": "John Smith",
  "issuedBy": "Admin"
}
```

**Response:** Returns created weigh-in object (201 Created)

---

### Standings

#### Get Tournament Standings
```
GET /tournaments/{tournamentId}/standings
```

**Response:**
```json
[
  {
    "teamId": "team-456",
    "teamNumber": 1,
    "members": [
      { "firstName": "John", "lastName": "Smith" },
      { "firstName": "Jane", "lastName": "Doe" }
    ],
    "day1Total": 12.7,
    "day1BigFish": 4.2,
    "day2Total": 15.3,
    "day2BigFish": 5.1,
    "grandTotal": 28.0,
    "rank": 1,
    "rankChange": 0
  }
]
```

---

### Statistics

#### Get Tournament Statistics
```
GET /tournaments/{tournamentId}/stats
```

**Response:**
```json
{
  "tournamentId": "tournament-123",
  "totalTeams": 12,
  "totalFishCaught": 145,
  "totalFishReleased": 28,
  "totalWeightCaught": 487.2,
  "avgDay1Weight": 19.8,
  "avgDay2Weight": 21.4,
  "bigFishDay1": 5.3,
  "bigFishDay2": 6.1,
  "stdDevDay1": 4.2,
  "stdDevDay2": 3.8
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid team ID",
  "code": "INVALID_TEAM_ID"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid API key",
  "code": "INVALID_API_KEY"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have access to this tournament",
  "code": "ACCESS_DENIED"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retryAfter": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Example: Integrate with External Dashboard

```python
import requests

API_KEY = "fta_your_api_key_here"
API_BASE = "https://api.fishingtourney.app/api"
TOURNAMENT_ID = "tournament-123"

def get_standings():
    headers = {"X-API-Key": API_KEY}
    response = requests.get(
        f"{API_BASE}/tournaments/{TOURNAMENT_ID}/standings",
        headers=headers
    )
    return response.json()

def get_stats():
    headers = {"X-API-Key": API_KEY}
    response = requests.get(
        f"{API_BASE}/tournaments/{TOURNAMENT_ID}/stats",
        headers=headers
    )
    return response.json()

# Fetch data
standings = get_standings()
stats = get_stats()

print(f"Standings ({len(standings)} teams)")
for team in standings:
    print(f"  Rank {team['rank']}: Team #{team['teamNumber']} - {team['grandTotal']} lbs")

print(f"\nAverage Day 1 Weight: {stats['avgDay1Weight']} lbs")
print(f"Average Day 2 Weight: {stats['avgDay2Weight']} lbs")
```

---

## SDK

Official SDKs coming soon for:
- JavaScript/TypeScript
- Python
- Go
- Ruby

---

## Webhook Events (Coming Soon)

Subscribe to webhook events for real-time updates:
- `weigh_in.created`
- `weigh_in.updated`
- `team.updated`
- `tournament.created`
- `standings.updated`

---

## Support

For API questions or issues:
- 📧 Email: api-support@fishingtourney.app
- 📖 Docs: https://docs.fishingtourney.app
- 💬 Community: https://github.com/fishingtourney/api-examples
