import { describe, it, expect } from "vitest";

/**
 * Unit test for the www -> non-www 301 redirect middleware.
 * Tests the redirect logic in isolation without spinning up a full server.
 */

type MockReq = {
  headers: { host: string };
  protocol: string;
  originalUrl: string;
};

type MockRes = {
  redirected: boolean;
  redirectStatus: number;
  redirectUrl: string;
  redirect: (status: number, url: string) => void;
};

function createMiddleware() {
  return (req: MockReq, res: MockRes, next: () => void) => {
    const host = req.headers.host || "";
    if (host.startsWith("www.")) {
      const nonWwwHost = host.slice(4);
      const redirectUrl = `${req.protocol}://${nonWwwHost}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }
    return next();
  };
}

function makeReq(host: string, path = "/"): MockReq {
  return { headers: { host }, protocol: "https", originalUrl: path };
}

function makeRes(): MockRes & { nextCalled: boolean } {
  const res = {
    redirected: false,
    redirectStatus: 0,
    redirectUrl: "",
    nextCalled: false,
    redirect(status: number, url: string) {
      this.redirected = true;
      this.redirectStatus = status;
      this.redirectUrl = url;
    },
  };
  return res;
}

describe("www -> non-www 301 redirect middleware", () => {
  const middleware = createMiddleware();

  it("redirects www.consciouselder.com to consciouselder.com with 301", () => {
    const req = makeReq("www.consciouselder.com", "/");
    const res = makeRes();
    middleware(req, res, () => { res.nextCalled = true; });

    expect(res.redirected).toBe(true);
    expect(res.redirectStatus).toBe(301);
    expect(res.redirectUrl).toBe("https://consciouselder.com/");
    expect(res.nextCalled).toBe(false);
  });

  it("redirects www subdomain with a path and query string", () => {
    const req = makeReq("www.consciouselder.com", "/articles/conscious-aging?ref=home");
    const res = makeRes();
    middleware(req, res, () => { res.nextCalled = true; });

    expect(res.redirectStatus).toBe(301);
    expect(res.redirectUrl).toBe("https://consciouselder.com/articles/conscious-aging?ref=home");
  });

  it("does not redirect non-www requests", () => {
    const req = makeReq("consciouselder.com", "/articles");
    const res = makeRes();
    middleware(req, res, () => { res.nextCalled = true; });

    expect(res.redirected).toBe(false);
    expect(res.nextCalled).toBe(true);
  });

  it("does not redirect localhost in development", () => {
    const req = makeReq("localhost:3000", "/");
    const res = makeRes();
    middleware(req, res, () => { res.nextCalled = true; });

    expect(res.redirected).toBe(false);
    expect(res.nextCalled).toBe(true);
  });

  it("does not redirect an IP address", () => {
    const req = makeReq("192.168.1.1:3000", "/health");
    const res = makeRes();
    middleware(req, res, () => { res.nextCalled = true; });

    expect(res.redirected).toBe(false);
    expect(res.nextCalled).toBe(true);
  });
});
