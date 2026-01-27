# About API Documentation

About 기능 변경사항에 대한 API 문서입니다.

## 변경 사항 요약

- ✅ **CREATE**: 새로운 About 생성 지원
- ✅ **READ**: 기본 About 조회 + 전체 목록 조회 (페이지네이션)
- ✅ **DELETE**: About 삭제 (기본 About 제외)
- ✅ **SET DEFAULT**: 기본 About 설정
- ❌ **UPDATE**: 지원하지 않음 (로깅 목적)

---

## 1. 기본 About 조회

**공개 API** - 인증 불필요

### Request

```http
GET /api/v1/about
```

### Response

```json
{
  "code": "OK",
  "message": "about 조회에 성공했습니다.",
  "data": {
    "id": 1,
    "content": "회사 소개 내용...",
    "isDefault": true,
    "createdAt": "2026-01-28T10:00:00",
    "updatedAt": "2026-01-28T10:00:00"
  }
}
```

### Error Response

```json
{
  "status": 404,
  "message": "기본 About를 찾을 수 없습니다."
}
```

---

## 2. About 목록 조회 (페이지네이션)

**관리자 전용 API** - ADMIN 권한 필요

### Request

```http
GET /api/v1/about/list?page=0&size=10&sort=createdAt,DESC
```

### Query Parameters

| Parameter | Type    | Required | Default        | Description                                |
| --------- | ------- | -------- | -------------- | ------------------------------------------ |
| page      | integer | No       | 0              | 페이지 번호 (0부터 시작)                   |
| size      | integer | No       | 10             | 페이지 크기                                |
| sort      | string  | No       | createdAt,DESC | 정렬 기준 (예: "createdAt,DESC", "id,ASC") |

### Response

```json
{
  "code": "OK",
  "message": "about 목록 조회에 성공했습니다.",
  "data": {
    "content": [
      {
        "id": 2,
        "content": "최신 About 내용...",
        "isDefault": false,
        "createdAt": "2026-01-28T11:00:00",
        "updatedAt": "2026-01-28T11:00:00"
      },
      {
        "id": 1,
        "content": "기본 About 내용...",
        "isDefault": true,
        "createdAt": "2026-01-28T10:00:00",
        "updatedAt": "2026-01-28T10:00:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 2,
    "last": true,
    "size": 10,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 2,
    "first": true,
    "empty": false
  }
}
```

### Error Response

```json
{
  "status": 403,
  "message": "관리자만 접근할 수 있습니다."
}
```

---

## 3. About 생성

**관리자 전용 API** - ADMIN 권한 필요

> [!IMPORTANT]
> **Breaking Change**: 기존 `POST /api/v1/about`는 수정(update)에서 생성(create)으로 변경되었습니다.

### Request

```http
POST /api/v1/about
Content-Type: application/json
```

### Request Body

```json
{
  "content": "새로운 About 내용..."
}
```

| Field   | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| content | string | Yes      | About 내용  |

### Response

```json
{
  "code": "CREATED",
  "message": "about 생성에 성공했습니다.",
  "data": {
    "id": 3,
    "content": "새로운 About 내용...",
    "isDefault": false,
    "createdAt": "2026-01-28T12:00:00",
    "updatedAt": "2026-01-28T12:00:00"
  }
}
```

### Error Response

```json
{
  "status": 403,
  "message": "관리자만 접근할 수 있습니다."
}
```

---

## 4. About 삭제

**관리자 전용 API** - ADMIN 권한 필요

> [!WARNING]
> 기본 About (`isDefault: true`)는 삭제할 수 없습니다.

### Request

```http
DELETE /api/v1/about/{id}
```

### Path Parameters

| Parameter | Type    | Required | Description     |
| --------- | ------- | -------- | --------------- |
| id        | integer | Yes      | 삭제할 About ID |

### Response

```json
{
  "code": "OK",
  "message": "about 삭제에 성공했습니다.",
  "data": null
}
```

### Error Responses

#### About를 찾을 수 없는 경우

```json
{
  "status": 404,
  "message": "존재하지 않는 About입니다."
}
```

#### 기본 About를 삭제하려는 경우

```json
{
  "status": 400,
  "message": "기본 About는 삭제할 수 없습니다."
}
```

---

## 5. 기본 About 설정

**관리자 전용 API** - ADMIN 권한 필요

> [!NOTE]
> 기존 기본 About는 자동으로 해제되고 선택한 About가 새로운 기본으로 설정됩니다.

### Request

```http
POST /api/v1/about/{id}/set-default
```

### Path Parameters

| Parameter | Type    | Required | Description              |
| --------- | ------- | -------- | ------------------------ |
| id        | integer | Yes      | 기본으로 설정할 About ID |

### Response

```json
{
  "code": "OK",
  "message": "기본 about 설정에 성공했습니다.",
  "data": null
}
```

### Error Response

```json
{
  "status": 404,
  "message": "존재하지 않는 About입니다."
}
```

---

## 공통 사항

### 인증 헤더

관리자 전용 API는 Bearer 토큰이 필요합니다:

```http
Authorization: Bearer {access_token}
```

### Response Data 구조

#### AboutContent

```typescript
interface AboutContent {
  id: number; // About ID
  content: string; // About 내용
  isDefault: boolean; // 기본 About 여부
  createdAt: string; // 생성 시간 (ISO 8601)
  updatedAt: string; // 수정 시간 (ISO 8601)
}
```

### 공통 Error 응답

```json
{
  "status": number,
  "message": string
}
```

---

## 마이그레이션 가이드

### 기존 API와의 차이점

#### ❌ 제거된 API

- **POST /api/v1/about** (수정 기능) → 더 이상 수정을 지원하지 않습니다.

#### ✨ 새로운 API

- **GET /api/v1/about/list** - About 목록 조회 (페이지네이션)
- **POST /api/v1/about** - About 생성 (기존 수정에서 생성으로 변경)
- **DELETE /api/v1/about/{id}** - About 삭제
- **POST /api/v1/about/{id}/set-default** - 기본 About 설정

#### 🔄 변경된 API

- **GET /api/v1/about** - 응답 구조 변경 (id, isDefault, timestamps 추가)

### 응답 구조 변경

#### Before (기존)

```json
{
  "code": "OK",
  "message": "about 조회에 성공했습니다.",
  "data": {
    "content": "About 내용"
  }
}
```

#### After (변경 후)

```json
{
  "code": "OK",
  "message": "about 조회에 성공했습니다.",
  "data": {
    "id": 1,
    "content": "About 내용",
    "isDefault": true,
    "createdAt": "2026-01-28T10:00:00",
    "updatedAt": "2026-01-28T10:00:00"
  }
}
```

---

## 사용 예시

### 시나리오 1: 새로운 About 추가 및 기본 설정

```javascript
// 1. About 생성
const createResponse = await fetch("/api/v1/about", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: "새로운 회사 소개 내용",
  }),
});
const { data: newAbout } = await createResponse.json();
// newAbout.id = 3, newAbout.isDefault = false

// 2. 기본으로 설정
await fetch(`/api/v1/about/${newAbout.id}/set-default`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
// 이제 ID=3이 기본 About, 기존 기본은 자동으로 해제됨
```

### 시나리오 2: About 목록 조회 및 페이지네이션

```javascript
// 첫 페이지 조회
const response = await fetch(
  "/api/v1/about/list?page=0&size=10&sort=createdAt,DESC",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
const { data } = await response.json();

console.log("총 페이지:", data.totalPages);
console.log("총 항목:", data.totalElements);
console.log("현재 페이지 항목:", data.content);
```

### 시나리오 3: 기본 About 조회 (공개)

```javascript
// 인증 없이 조회 가능
const response = await fetch("/api/v1/about");
const { data: defaultAbout } = await response.json();

console.log("기본 About:", defaultAbout.content);
console.log("생성일:", defaultAbout.createdAt);
```
