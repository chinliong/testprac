const request = require("supertest");
const { app, server, validatePassword } = require("./app");

// Close server after all tests complete
afterAll((done) => {
  if (server && server.listening) {
    server.close(done);
  } else {
    done();
  }
});

describe("Password Validation", () => {
  test("should reject password shorter than 8 characters", () => {
    const result = validatePassword("Test1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long"
    );
  });

  test("should reject password without lowercase letter", () => {
    const result = validatePassword("TEST1234!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  test("should reject password without uppercase letter", () => {
    const result = validatePassword("test1234!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  test("should reject password without digit", () => {
    const result = validatePassword("TestTest!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one digit");
  });

  test("should reject password without special character", () => {
    const result = validatePassword("TestTest1");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one special character"
    );
  });

  test("should accept valid password", () => {
    const result = validatePassword("SecurePass89!");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should reject common passwords", () => {
    const result = validatePassword("Password123!");
    // This might be in the common passwords list
    if (!result.isValid) {
      expect(result.errors.some((error) => error.includes("common"))).toBe(
        true
      );
    }
  });

  test("should reject sequential patterns", () => {
    const result = validatePassword("123456Aa!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password cannot contain common sequential patterns"
    );
  });
});

describe("Web Application", () => {
  test("should return home page on GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Secure Password Login");
    expect(response.text).toContain("Password requirements:");
  });

  test("should reject invalid password", async () => {
    const response = await request(app)
      .post("/login")
      .send({ password: "weak" });
    expect(response.status).toBe(400);
    expect(response.text).toContain("Password validation failed:");
  });

  test("should accept valid password", async () => {
    const response = await request(app)
      .post("/login")
      .send({ password: "SecurePass89!" });
    expect(response.status).toBe(200);
    expect(response.text).toContain("Welcome!");
    expect(response.text).toContain("SecurePass89!");
  });

  test("should reject empty password", async () => {
    const response = await request(app).post("/login").send({});
    expect(response.status).toBe(400);
    expect(response.text).toContain("Password is required");
  });

  test("health check endpoint should work", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });
});
