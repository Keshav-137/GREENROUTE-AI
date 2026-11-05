/**
 * This file is generated or configured to match the GreenRoute AI FastAPI OpenAPI Schema.
 * Generation script: npm run generate-api-types (when backend is running at http://localhost:8000)
 */

export interface paths {
  "/api/v1/plan": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            origin: { name: string; lat: number; lon: number };
            destination: { name: string; lat: number; lon: number };
            vehicle_type: string;
            cargo_load_tons: number;
            departure_time: string;
            deadline: string;
            priority_weights?: {
              time: number;
              fuel: number;
              co2: number;
              cost: number;
              risk: number;
            };
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/api/v1/rerank": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            trip_id: string;
            weights: {
              time: number;
              fuel: number;
              co2: number;
              cost: number;
              risk: number;
            };
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/api/v1/report/{trip_id}": {
    get: {
      parameters: {
        path: {
          trip_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/pdf": Blob;
          };
        };
      };
    };
  };
  "/api/v1/health": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              status: string;
              version: string;
              services: Record<string, string>;
            };
          };
        };
      };
    };
  };
}

